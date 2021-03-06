import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome',
  value: number,
  category: string
};

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const parsers = csvParse({
      from_line: 2
    });

    const parseCSV = contactsReadStream.pipe(parsers);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => 
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
      }
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title
    );

    const addCategoriesTitle = categories
    .filter((category) => !existentCategoriesTitle.includes(category))
    .filter((value, index, self) => self.indexOf(value) === index );

    const newCategories = categoriesRepository.create(
      addCategoriesTitle.map(title => ({
        title
      }))
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories ];

    const createdTransations = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          finalCategory => finalCategory.title === transaction.category
        )
      }))
    );


    await transactionsRepository.save(createdTransations);
    fs.promises.unlink(filePath);
    
    return createdTransations;
  }
}

export default ImportTransactionsService;
