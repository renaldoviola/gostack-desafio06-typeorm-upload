import AppError from '../errors/AppError';
import { getRepository, getCustomRepository} from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';


interface Request{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({title, type, value, category}: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Type is invalid.');
    }

    if(type === 'outcome'){
      const balance = await transactionRepository.getBalance();

      if(value > balance.total){
        throw new AppError("Insufficient balance. Withdrawal of "
        .concat(value.toString()
        .concat(' will not be allowed.')));
      }
    }

    var categoryRepository = await categoriesRepository.findOne({
      where: {title: category}
    });

    if(!categoryRepository){
      categoryRepository = categoriesRepository.create({title: category});

      await categoriesRepository.save(categoryRepository);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: categoryRepository
    });

    await transactionRepository.save(transaction);

    return transaction;

  }
}

export default CreateTransactionService;
