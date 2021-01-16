import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    let transactionCategory = null;

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }
 
    if (!title || title === '') {
      throw new AppError('Title is required', 400);
    }

    if (!value) {
      throw new AppError('Value is required', 400);
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type', 400);
    }

    transactionCategory = await categoriesRepository.findOne({
      title: category
    });

    if (!transactionCategory) {
      transactionCategory = await categoriesRepository.create({ title: category });

      await categoriesRepository.save(transactionCategory); 
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
