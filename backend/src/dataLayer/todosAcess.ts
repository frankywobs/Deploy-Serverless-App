import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
var AWSXRay = require('aws-xray-sdk'); 

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    // getTodoItem //     const result = await this.docClient.query({
    //     (_todoId: string, _userId: string): TodoItem | PromiseLike<TodoItem> {
    //         throw new Error('Method not implemented.')
    // }
    // static createTodoItem: any
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosUserIndex = process.env.INDEX_NAME
        ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos')
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId' : userId
            }
        }).promise()
        
        const items = result.Items
        return items as TodoItem[]
    }

    // async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
    //     const result = await this.docClient.query({
    //         TableName: this.todosTable,
    //         IndexName: this.todosUserIndex,
    //         KeyConditionExpression: 'userId = :userId and todoId = :todoId',
    //         ExpressionAttributeValues: {
    //             ':userId' : userId,
    //             ':todoId' : todoId
    //         }
    //     }).promise()

    //     const item = result.Items[0]
    //     return item as TodoItem
    // }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Create todo item called')


        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
        logger.info('Todo item created', result)

        return todoItem as TodoItem
    }

    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo item function called')

        await this.docClient
        .update({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "createdAt": userId  
            },
            UpdateExpression: 'set #n = :name, done = :done, dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':done': todoUpdate.done,
                ':dueDate': todoUpdate.dueDate
            },
            ExpressionAttributeNames: {
                '#n': 'name'
            }
        })
        .promise()

        return todoUpdate 

    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {

        var params = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            ConditionExpression:
                'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }

        await this.docClient.delete(params).promise()
    }

    async setItemUrl(todoId: string, userId: string, itemUrl: string): Promise<void> {
        var params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': itemUrl
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await this.docClient.update(params)
        .promise()
    }

}


       
