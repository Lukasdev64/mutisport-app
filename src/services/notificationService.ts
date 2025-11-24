import type { RegistrationData } from '../features/tournament/logic/selectionAlgorithm';

export type EmailType = 'confirmation' | 'rejection' | 'waitlist';

export interface EmailLog {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
  type: EmailType;
}

export class NotificationService {
  static logs: EmailLog[] = [];

  static sendAcceptanceEmail(player: RegistrationData, tournamentName: string) {
    const subject = `🎉 Félicitations ! Vous êtes sélectionné pour ${tournamentName}`;
    const body = `
      Bonjour ${player.name},
      
      Nous avons le plaisir de vous confirmer votre participation au tournoi "${tournamentName}".
      
      Votre profil correspondait parfaitement aux critères de sélection (inscription rapide et disponibilités compatibles).
      
      Vous recevrez bientôt votre planning de matchs.
      
      Sportivement,
      L'équipe d'organisation
    `;
    
    this.logEmail(player.email, subject, body, 'confirmation');
  }

  static sendRejectionEmail(player: RegistrationData, tournamentName: string, reason: string) {
    const subject = `Information concernant votre inscription à ${tournamentName}`;
    const body = `
      Bonjour ${player.name},
      
      Merci de l'intérêt que vous portez au tournoi "${tournamentName}".
      
      Malheureusement, nous ne pouvons pas retenir votre inscription pour cette édition.
      Raison principale : ${reason}
      
      Nous espérons vous revoir lors d'un prochain événement !
      
      Sportivement,
      L'équipe d'organisation
    `;
    
    this.logEmail(player.email, subject, body, 'rejection');
  }

  static sendWaitlistEmail(player: RegistrationData, tournamentName: string, position: number) {
    const subject = `Mise sur liste d'attente - ${tournamentName}`;
    const body = `
      Bonjour ${player.name},
      
      Le tournoi "${tournamentName}" est actuellement complet.
      
      Cependant, votre profil a retenu notre attention et vous avez été placé sur liste d'attente (Position: ${position}).
      Si une place se libère, vous serez contacté immédiatement.
      
      Sportivement,
      L'équipe d'organisation
    `;
    
    this.logEmail(player.email, subject, body, 'waitlist');
  }

  private static logEmail(to: string, subject: string, body: string, type: EmailType) {
    const log: EmailLog = {
      to,
      subject,
      body: body.trim(),
      sentAt: new Date(),
      type
    };
    
    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    this.logs.push(log);
    
    // In a real app, we would call an API endpoint here
  }

  static getLogs() {
    return this.logs;
  }
  
  static clearLogs() {
    this.logs = [];
  }
}
