import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Edge Function: send-reminder
 *
 * Sends a push notification via OneSignal to specific users.
 * Can be used for:
 * - Match reminders
 * - Round start notifications
 * - Match result notifications
 * - Custom tournament announcements
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "match_reminder" | "round_start" | "match_result" | "announcement";
  tournamentId: string;
  tournamentName: string;
  // Target filters
  targetPlayerId?: string; // Send to specific player
  targetPlayerIds?: string[]; // Send to multiple players
  targetRole?: "player" | "spectator" | "organizer"; // Send to all with this role in tournament
  // Content
  title: string;
  message: string;
  // Additional data
  matchId?: string;
  scheduledAt?: string;
  location?: string;
}

interface OneSignalNotification {
  app_id: string;
  headings: { en: string; fr: string };
  contents: { en: string; fr: string };
  filters?: Array<{
    field?: string;
    key?: string;
    relation?: string;
    value?: string;
    operator?: string;
  }>;
  include_player_ids?: string[];
  data?: Record<string, unknown>;
  chrome_web_icon?: string;
  firefox_icon?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID") ?? "";
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY") ?? "";

    if (!oneSignalAppId || !oneSignalApiKey) {
      return new Response(
        JSON.stringify({ error: "OneSignal not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const body: NotificationRequest = await req.json();

    // Validate required fields
    if (!body.tournamentId || !body.title || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tournamentId, title, message" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Build OneSignal notification payload
    const notification: OneSignalNotification = {
      app_id: oneSignalAppId,
      headings: { en: body.title, fr: body.title },
      contents: { en: body.message, fr: body.message },
      data: {
        type: body.type,
        tournament_id: body.tournamentId,
        match_id: body.matchId,
        scheduled_at: body.scheduledAt,
      },
      chrome_web_icon: "/icons/icon-192x192.png",
      firefox_icon: "/icons/icon-192x192.png",
    };

    // Build filters based on target
    if (body.targetPlayerId) {
      // Single player
      notification.filters = [
        { field: "tag", key: "player_id", relation: "=", value: body.targetPlayerId },
        { operator: "AND" },
        { field: "tag", key: "tournament_id", relation: "=", value: body.tournamentId },
      ];
    } else if (body.targetPlayerIds && body.targetPlayerIds.length > 0) {
      // Multiple players - use OR filters
      const filters: OneSignalNotification["filters"] = [];
      body.targetPlayerIds.forEach((playerId, index) => {
        if (index > 0) {
          filters.push({ operator: "OR" });
        }
        filters.push(
          { field: "tag", key: "player_id", relation: "=", value: playerId },
        );
      });
      // Add tournament filter
      filters.push({ operator: "AND" });
      filters.push({ field: "tag", key: "tournament_id", relation: "=", value: body.tournamentId });
      notification.filters = filters;
    } else if (body.targetRole) {
      // Target by role (players, spectators, or organizers for this tournament)
      notification.filters = [
        { field: "tag", key: "role", relation: "=", value: body.targetRole },
        { operator: "AND" },
        { field: "tag", key: "tournament_id", relation: "=", value: body.tournamentId },
      ];
    } else {
      // Send to all users subscribed to this tournament
      notification.filters = [
        { field: "tag", key: "tournament_id", relation: "=", value: body.tournamentId },
      ];
    }

    // Send notification via OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("OneSignal API error:", result);
      return new Response(
        JSON.stringify({
          error: "Failed to send notification",
          details: result.errors?.[0] || "Unknown error",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Notification sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        notificationId: result.id,
        recipients: result.recipients,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("send-reminder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
