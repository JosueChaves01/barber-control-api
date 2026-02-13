import { Response, NextFunction } from 'express';
import organizationService from '@services/organization.service';
import { RequestWithUser } from '@types';

export class OrganizationsController {
  async getOrganizations(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { skip, take } = req.query;
      const organizations = await organizationService.getOrganizations(
        skip ? Number(skip) : undefined,
        take ? Number(take) : undefined
      );
      res.json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrganization(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const organization = await organizationService.getOrganization(
        req.params.id,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'Usuario no autenticado' },
        });
        return;
      }

      const organization = await organizationService.updateOrganization(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );
      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrganizationsController();

