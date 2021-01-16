import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class AddCategoryIdFieldToTransactions1610809638841 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn('transactions', new TableColumn({
            name: 'category_id',
            type: 'uuid',
            isNullable: true
        }));

        await queryRunner.createForeignKey('transactions', new TableForeignKey({
            name: 'TransactionCategoryId',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'TransactionCategoryId');

        await queryRunner.dropColumn('transactions', 'category_id');
    }

}
