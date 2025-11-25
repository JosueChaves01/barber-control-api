import { google } from 'googleapis';
import { googleConfig } from '@config/google';
import appointmentRepository from '@repositories/appointment.repository';
import { NotFoundError } from '@utils/errors';

export class GoogleService {
  private oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async syncAppointmentToCalendar(appointmentId: string, tokens?: any) {
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }

    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Cita no encontrada');
    }

    // Ensure relations are loaded
    if (!appointment.barber?.user || !appointment.client?.user) {
      throw new NotFoundError('Información del barbero o cliente no disponible');
    }

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const startDate = new Date(appointment.appointmentDate);
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);

    const barberName = `${appointment.barber.user.firstName} ${appointment.barber.user.lastName}`;
    const clientName = `${appointment.client.user.firstName} ${appointment.client.user.lastName}`;

    const event = {
      summary: `Cita con ${barberName}`,
      description: appointment.notes || `Cita en ${appointment.organization.name}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Mexico_City', // Adjust as needed
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      attendees: [
        {
          email: appointment.client.user.email,
          displayName: clientName,
        },
        {
          email: appointment.barber.user.email,
          displayName: barberName,
        },
      ],
    };

    let googleEventId = appointment.googleEventId;

    if (googleEventId) {
      // Update existing event
      await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: event,
      });
    } else {
      // Create new event
      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      googleEventId = createdEvent.data.id || undefined;

      // Update appointment with google event id
      if (googleEventId) {
        await appointmentRepository.update(appointmentId, {
          googleEventId,
        });
      }
    }

    return { googleEventId };
  }

  async deleteEventFromCalendar(appointmentId: string, tokens?: any) {
    if (tokens) {
      this.oauth2Client.setCredentials(tokens);
    }

    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Cita no encontrada');
    }

    if (!appointment.googleEventId) {
      return; // No event to delete
    }

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: appointment.googleEventId,
      });

      // Clear google event id from appointment
      await appointmentRepository.update(appointmentId, {
        googleEventId: null,
      });
    } catch (error) {
      // Event might not exist, which is fine
      console.error('Error deleting Google Calendar event:', error);
    }
  }
}

export default new GoogleService();

