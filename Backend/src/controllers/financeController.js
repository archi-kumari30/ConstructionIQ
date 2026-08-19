import financeService from '../services/financeService.js';
import ApiResponse from '../utils/apiResponse.js';
import DeliveryDto from '../dto/deliveryDto.js';
import BudgetDto from '../dto/budgetDto.js';
import ExpenseDto from '../dto/expenseDto.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

// --- Deliveries ---
const createDelivery = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
const delivery = await financeService.createDelivery(projectId, req.body, req.body.supplierId);  return ApiResponse.success(
    res,
    'Logistics shipment entry created successfully',
    DeliveryDto.toResponse(delivery),
    HTTP_CODES.CREATED
  );
});

const updateDeliveryStatus = asyncWrapper(async (req, res) => {
  const { projectId, id } = req.params;
  const delivery = await financeService.updateDeliveryStatus(projectId, id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    `Delivery shipment status updated to ${req.body.status}`,
    DeliveryDto.toResponse(delivery),
    HTTP_CODES.OK
  );
});

const listDeliveries = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await financeService.listDeliveries(projectId, { page, limit });
  return ApiResponse.success(res, 'Project deliveries retrieved successfully', {
    deliveries: DeliveryDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Budgets ---
const allocateBudget = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const budget = await financeService.allocateBudget(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Budget allocation registered successfully',
    BudgetDto.toResponse(budget),
    HTTP_CODES.OK
  );
});

const getBudgetSummary = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const budgets = await financeService.getBudgetSummary(projectId);
  return ApiResponse.success(
    res,
    'Budget details retrieved successfully',
    BudgetDto.toResponseList(budgets),
    HTTP_CODES.OK
  );
});

// --- Expenses ---
const logExpense = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const expense = await financeService.logExpense(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Expense log recorded successfully',
    ExpenseDto.toResponse(expense),
    HTTP_CODES.CREATED
  );
});

const listExpenses = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await financeService.listExpenses(projectId, { page, limit });
  return ApiResponse.success(res, 'Project expense logs retrieved successfully', {
    expenses: ExpenseDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

export {
  createDelivery,
  updateDeliveryStatus,
  listDeliveries,
  allocateBudget,
  getBudgetSummary,
  logExpense,
  listExpenses
};
export default { createDelivery, updateDeliveryStatus, listDeliveries, allocateBudget, getBudgetSummary, logExpense, listExpenses };
