import src from '../src/finder';
import waldo from '../lib/waldo';
import waldoMin from '../lib/waldo.min';

const global = window || global;

// dummy objects
global.testObj = {
  obj: {d: 4},
  arr1: [1, 2, 3, 4, 5],
  arr2: ['a', 'b', 'c'],
  fn: function () {},
  num: 1
}

global.testObj.circ = {a: 3, b: global.testObj.obj};
let logSpy, checkConsoleLog;

[src, waldo, waldoMin].forEach(find => {
  [true, false].forEach(debugMode => {
    find.debug(debugMode);
    describe('waldo', () => {
      beforeEach(() => {
        logSpy = spyOn(console, 'log').and.callThrough();
        checkConsoleLog = (str) => {
          if (debugMode) {
            expect(console.log).toHaveBeenCalledWith(str);
          }
        }
      });

      describe('findByName', () => {
        it('should find root level object', () => {
          find.byName('circ');
          checkConsoleLog(
            `global.testObj.circ -> (object) ${global.testObj.circ}`);
        });
        it('should find root level array', () => {
          find.byName('arr1');
          checkConsoleLog(
            `global.testObj.arr1 -> (object) ${global.testObj.arr1}`);
        });
        it('should find nested property', () => {
          find.byName('a');
          checkConsoleLog(
            'global.testObj.circ.a -> (number) 3');
        });
        it('should detect circular references', () => {
          find.byName('d');
          checkConsoleLog(
            'global.testObj.obj.d -> (<global.testObj.obj>) 4');
        });
      });

      describe('findByType', () => {
        it('should find first class objects types', () => {
          find.byType(Array, {obj: global.testObj, path: 'testObj'});
          // TODO need to check for multiple matches
          checkConsoleLog(
            `testObj.arr1 -> (object) ${global.testObj.arr1}`);
          logSpy.calls.reset();
          find.byType(Function, {obj: global.testObj, path: 'testObj'});
          checkConsoleLog(
            `testObj.fn -> (function) ${global.testObj.fn}`);
        });
        it('should not find primitive types', () => {
          find.byType(String, {obj: global.testObj, path: 'testObj'});
          expect(console.log).not.toHaveBeenCalled();
        });
      });

      describe('findByValue', () => {
        it('should find number', () => {
          find.byValue(3, {obj: global.testObj, path: 'testObj'});
          checkConsoleLog(
            'testObj.circ.a -> (number) 3');
        });
        it('should find number and detect circular reference', () => {
          find.byValue(4, {obj: global.testObj, path: 'testObj'});
          checkConsoleLog(
            'testObj.obj.d -> (<testObj.obj>) 4');
        });
        it('should find complex value', () => {
          find.byValue(global.testObj.arr2, {obj: global.testObj, path: 'testObj'});
          checkConsoleLog(
            `testObj.arr2 -> (object) ${global.testObj.arr2}`);
        });
      });

      describe('findByValueCoreced', () => {
        it('should find number equivalent of a string', () => {
          find.byValueCoerced('3', {obj: global.testObj, path: 'testObj'});
          checkConsoleLog(
            'testObj.circ.a -> (number) 3');
        });
        it('should not find falsey values when non exist', () => {
          find.byValueCoerced(false, {obj: global.testObj, path: 'testObj'});
          expect(console.log).not.toHaveBeenCalled();
        });
      });

      describe('findByCustomeFilter', () => {
        it('should return custom filter matches', () => {
          find.custom((searchTerm, obj, prop) => (obj[prop] === 1) && (prop == 'num'));
          checkConsoleLog('global.testObj.num -> (number) 1');
        });
        it('should report no matches when no custom filter matches', () => {
          find.custom((searchTerm, obj, prop) => (obj[prop] === 1) && (prop == 'pie'));
          expect(console.log).not.toHaveBeenCalled();
        });
        // TODO: test searchTerm param
      });
    });
  });
});
