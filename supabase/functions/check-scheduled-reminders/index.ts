import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Edge Function: check-scheduled-reminders
 *
 * This function should be called periodically (e.g., every 5 minutes via pg_cron)
 * to check for matches that need reminder notifications sent.
 *
 * It queries matches with scheduledAt in the next X minutes (based on reminderConfig)
 * and triggers send-reminder for each match that hasn't had a reminder sent yet.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Match {
  id: string;
  scheduledAt: string;
  player1Id?: string;
  player2Id?: string;
  location?: string;
  remindersSentAt?: string[];
}

interface Tournament {
  id: string;
  name: string;
  reminderConfig?: {
    enabled: boolean;
    reminderTimes: number[]; // Minutes before match
    notifyOnRoundStart: boolean;
    notifyOnMatchEnd: boolean;
  };
  rounds: Array<{
    matches: Match[];
  }>;
  players: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
}

interface ReminderToSend {
  tournamentId: string;
  tournamentName: string;
  matchId: string;
  playerId: string;
  playerName: string;
  scheduledAt: string;
  location?: string;
  opponentName?: string;
  reminderMinutes: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID") ?? "";
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY") ?? "";

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.warn("OneSignal credentials not configured");
      return new Response(
        JSON.stringify({ error: "OneSignal not configured", reminders: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Use service role for admin access to tournaments table
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active tournaments with scheduling enabled
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("tournaments")
      .select("*")
      .eq("status", "active");

    if (tournamentsError) {
      throw new Error(`Failed to fetch tournaments: ${tournamentsError.message}`);
    }

    const now = new Date();
    const remindersToSend: ReminderToSend[] = [];

    // Process each tournament
    for (const tournament of (tournaments || []) as Tournament[]) {
      const reminderConfig = tournament.reminderConfig;

      // Skip if reminders are not enabled
      if (!reminderConfig?.enabled || !reminderConfig.reminderTimes?.length) {
        continue;
      }

      // Check each match in each round
      for (const round of tournament.rounds || []) {
        for (const match of round.matches || []) {
          if (!match.scheduledAt || !match.player1Id || !match.player2Id) {
            continue;
          }

          const matchTime = new Date(match.scheduledAt);
          const minutesUntilMatch = (matchTime.getTime() - now.getTime()) / (1000 * 60);

          // Check each reminder time
          for (const reminderMinutes of reminderConfig.reminderTimes) {
            // Check if it's time to send this reminder (within 2 minute window)
            const targetTime = reminderMinutes;
            if (minutesUntilMatch > targetTime - 1 && minutesUntilMatch <= targetTime + 1) {
              // Check if this reminder was already sent
              const reminderKey = `${match.id}-${reminderMinutes}`;
              const alreadySent = match.remindersSentAt?.some(
                (r) => r.includes(reminderKey)
              );

              if (!alreadySent) {
                // Get player names
                const player1 = tournament.players.find((p) => p.id === match.player1Id);
                const player2 = tournament.players.find((p) => p.id === match.player2Id);

                if (player1) {
                  remindersToSend.push({
                    tournamentId: tournament.id,
                    tournamentName: tournament.name,
                    matchId: match.id,
                    playerId: player1.id,
                    playerName: player1.name,
                    scheduledAt: match.scheduledAt,
                    location: match.location,
                    opponentName: player2?.name,
                    reminderMinutes,
                  });
                }

                if (player2) {
                  remindersToSend.push({
                    tournamentId: tournament.id,
                    tournamentName: tournament.name,
                    matchId: match.id,
                    playerId: player2.id,
                    playerName: player2.name,
                    scheduledAt: match.scheduledAt,
                    location: match.location,
                    opponentName: player1?.name,
                    reminderMinutes,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Send notifications via OneSignal
    let sentCount = 0;
    const errors: string[] = [];

    for (const reminder of remindersToSend) {
      try {
        const timeText = formatReminderTime(reminder.reminderMinutes);
        const locationText = reminder.location ? ` - ${reminder.location}` : "";

        // Send notification via OneSignal API
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${oneSignalApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            // Target users by player_id tag
            filters: [
              { field: "tag", key: "player_id", relation: "=", value: reminder.playerId },
              { operator: "AND" },
              { field: "tag", key: "tournament_id", relation: "=", value: reminder.tournamentId },
            ],
            headings: { en: `⏰ Match ${timeText}`, fr: `⏰ Match ${timeText}` },
            contents: {
              en: `${reminder.tournamentName}: vs ${reminder.opponentName || "TBD"}${locationText}`,
              fr: `${reminder.tournamentName}: vs ${reminder.opponentName || "TBD"}${locationText}`,
            },
            data: {
              type: "match_reminder",
              tournament_id: reminder.tournamentId,
              match_id: reminder.matchId,
              scheduled_at: reminder.scheduledAt,
            },
            // Web push specific
            chrome_web_icon: "/icons/icon-192x192.png",
            firefox_icon: "/icons/icon-192x192.png",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0] || "OneSignal API error");
        }

        sentCount++;

        // Mark reminder as sent (update the tournament in DB)
        const reminderKey = `${reminder.matchId}-${reminder.reminderMinutes}-${new Date().toISOString()}`;
        // Note: This is a simplified approach. In production, you might want to
        // update the match.remindersSentAt array in the JSONB column
        console.log(`Reminder sent for match ${reminder.matchId} to player ${reminder.playerId}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Match ${reminder.matchId}: ${errorMessage}`);
        console.error(`Failed to send reminder for match ${reminder.matchId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersFound: remindersToSend.length,
        remindersSent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("check-scheduled-reminders error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function formatReminderTime(minutes: number): string {
  if (minutes < 60) {
    return `dans ${minutes} minutes`;
  } else if (minutes === 60) {
    return "dans 1 heure";
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `dans ${hours} heure${hours > 1 ? "s" : ""}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `dans ${days} jour${days > 1 ? "s" : ""}`;
  }
}
