import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    var balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0
    };

    transactions.forEach( transaction => {
      if(transaction.type === 'income')
        balance.income += Number(transaction.value);
      else if(transaction.type === 'outcome')
        balance.outcome += Number(transaction.value);
    });

    balance.total = balance.income - balance.outcome;

    return balance || null;
  }
}

export default TransactionsRepository;
