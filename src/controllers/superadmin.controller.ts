import { Request, Response, NextFunction } from 'express';
import organizationService from '@services/organization.service';
import userRepository from '@repositories/user.repository';
import { RequestWithUser } from '@types';

export class SuperAdminController {
  async createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationService.createOrganization(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrganizations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizations = await organizationService.getAllOrganizations();
      res.json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await organizationService.createAdmin(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, page = '1', limit = '10' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [users, total] = await Promise.all([
        userRepository.findAll(role ? { role: role as any } : undefined, skip, take),
        userRepository.count(role ? { role: role as any } : undefined),
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SuperAdminController();

