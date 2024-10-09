import {describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import TodoService from '../src/todoService.js';
describe('todoService test suite', ()=> {
      describe('#list', ()=> {
            let _todoService;
            let _dependencies;
            const mockDatabase =[
              {
                text: 'I must plan my trip to Europe',
                when: new Date('2021-03-22'),
                status: 'late',
                id: '8b1a8289-b8a8-4414-b6f5-50ab040d0b3d'
              }
            ] 
            beforeEach((context) => {
                _dependencies = {
                todoRepository:{
                  list:  context.mock.fn(async()=> mockDatabase)
                }
              }
              _todoService = new TodoService(_dependencies);
          });
          it('should return a list of item uppercase text', async() => {
              const expected = mockDatabase.map(({text,...result}) => ({text: text.toUpperCase(),...result}));
              const result = await _todoService.list();
              assert.deepStrictEqual(result, expected);
              const fnMock = _dependencies.todoRepository.list.mock;
              assert.strictEqual(fnMock.callCount(),1);
          })
     })

     describe('#create', ()=> {
        let  _todoService;
        let _dependencies;
        const mockDatabase =[
          {
            text: 'I must plan my trip to Europe',
            when: new Date('2021-03-22'),
            status: 'late',
            id: '8b1a8289-b8a8-4414-b6f5-50ab040d0b3d'
          }
        ] 
    });
});