import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../config/mock-db';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/response';
import {
  Issue,
  Reporter,
  IssueWithReporter,
  CreateIssueRequest,
  UpdateIssueRequest,
  GetIssuesQuery,
} from './types';

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type }: CreateIssueRequest = req.body;
    const reporterId = req.user?.id;

    if (!title || !description || !type) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Title, description, and type are required'
      );
    }

    if (title.length > 150) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Title must be at most 150 characters'
      );
    }

    if (description.length < 20) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Description must be at least 20 characters'
      );
    }

    if (!['bug', 'feature_request'].includes(type)) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Type must be either bug or feature_request'
      );
    }

    const issue = await db.issues.insert({
      title,
      description,
      type,
      reporter_id: reporterId!
    });

    return sendSuccessResponse(
      res,
      StatusCodes.CREATED,
      'Issue created successfully',
      issue
    );
  } catch (error) {
    console.error('Create issue error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};

export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort = 'newest', type, status } = req.query;

    const issues = await db.issues.findAll({
      type: type as string,
      status: status as string,
      sort: sort as 'newest' | 'oldest'
    });

    if (issues.length === 0) {
      return sendSuccessResponse(res, StatusCodes.OK, 'No issues found', []);
    }

    const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
    const reporters = await db.users.findByIds(reporterIds);

    const reportersMap: Record<number, Reporter> = {};
    reporters.forEach((reporter) => {
      reportersMap[reporter.id] = {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role
      };
    });

    const issuesWithReporters: IssueWithReporter[] = issues.map((issue) => ({
      ...issue,
      reporter: reportersMap[issue.reporter_id],
    }));

    return sendSuccessResponse(res, StatusCodes.OK, '', issuesWithReporters);
  } catch (error) {
    console.error('Get all issues error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};

export const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issueId = parseInt(id, 10);

    const issue = await db.issues.findById(issueId);

    if (!issue) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Issue not found'
      );
    }

    const reporter = await db.users.findById(issue.reporter_id);

    const issueWithReporter: IssueWithReporter = {
      ...issue,
      reporter: {
        id: reporter!.id,
        name: reporter!.name,
        role: reporter!.role
      },
    };

    return sendSuccessResponse(res, StatusCodes.OK, '', issueWithReporter);
  } catch (error) {
    console.error('Get single issue error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issueId = parseInt(id, 10);
    const { title, description, type }: UpdateIssueRequest = req.body;
    const user = req.user;

    const issue = await db.issues.findById(issueId);

    if (!issue) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Issue not found'
      );
    }

    if (user?.role !== 'maintainer') {
      if (issue.reporter_id !== user?.id) {
        return sendErrorResponse(
          res,
          StatusCodes.FORBIDDEN,
          'You can only update your own issues'
        );
      }
      if (issue.status !== 'open') {
        return sendErrorResponse(
          res,
          StatusCodes.CONFLICT,
          'You can only update issues with open status'
        );
      }
    }

    const updates: Partial<Omit<Issue, 'id' | 'created_at' | 'updated_at'>> = {};

    if (title !== undefined) {
      if (title.length > 150) {
        return sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Title must be at most 150 characters'
        );
      }
      updates.title = title;
    }

    if (description !== undefined) {
      if (description.length < 20) {
        return sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Description must be at least 20 characters'
        );
      }
      updates.description = description;
    }

    if (type !== undefined) {
      if (!['bug', 'feature_request'].includes(type)) {
        return sendErrorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          'Type must be either bug or feature_request'
        );
      }
      updates.type = type;
    }

    if (Object.keys(updates).length === 0) {
      return sendErrorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'No fields to update'
      );
    }

    const updatedIssue = await db.issues.update(issueId, updates);

    return sendSuccessResponse(
      res,
      StatusCodes.OK,
      'Issue updated successfully',
      updatedIssue
    );
  } catch (error) {
    console.error('Update issue error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issueId = parseInt(id, 10);

    const issue = await db.issues.findById(issueId);

    if (!issue) {
      return sendErrorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'Issue not found'
      );
    }

    await db.issues.delete(issueId);

    return sendSuccessResponse(
      res,
      StatusCodes.OK,
      'Issue deleted successfully'
    );
  } catch (error) {
    console.error('Delete issue error:', error);
    return sendErrorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }
};
