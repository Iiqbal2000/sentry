import displayRawContent, {
  getJavaFrame,
  getJavaPreamble,
} from 'sentry/components/events/interfaces/crashContent/stackTrace/rawContent';
import type {StacktraceType} from 'sentry/types';

describe('RawStacktraceContent', function () {
  describe('getJavaFrame()', function () {
    it('should render java frames', function () {
      expect(
        getJavaFrame(
          TestStubs.Frame({
            module: 'org.mortbay.thread.QueuedThreadPool$PoolThread',
            function: 'run',
            filename: 'QueuedThreadPool.java',
            lineNo: 582,
          })
        )
      ).toEqual(
        '    at org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java:582)'
      );

      // without line number
      expect(
        getJavaFrame(
          TestStubs.Frame({
            module: 'org.mortbay.thread.QueuedThreadPool$PoolThread',
            function: 'run',
            filename: 'QueuedThreadPool.java',
          })
        )
      ).toEqual(
        '    at org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java)'
      );

      // without line number and filename
      expect(
        getJavaFrame(
          TestStubs.Frame({
            module: 'org.mortbay.thread.QueuedThreadPool$PoolThread',
            function: 'run',
            filename: 'QueuedThreadPool.java',
          })
        )
      ).toEqual(
        '    at org.mortbay.thread.QueuedThreadPool$PoolThread.run(QueuedThreadPool.java)'
      );
    });
  });

  describe('getJavaPreamble()', function () {
    it('takes a type and value', () => {
      expect(
        getJavaPreamble(
          TestStubs.Frame({
            type: 'Baz',
            value: 'message',
            module: undefined,
          })
        )
      ).toEqual('Baz: message');
    });

    it('takes a module name', () => {
      expect(
        getJavaPreamble(
          TestStubs.Frame({
            module: 'foo.bar',
            type: 'Baz',
            value: 'message',
          })
        )
      ).toEqual('foo.bar.Baz: message');
    });
  });

  describe('render()', function () {
    const exception = TestStubs.EventStacktraceException({
      module: 'example.application',
      type: 'Error',
      value: 'an error occurred',
    });

    const data: StacktraceType = {
      hasSystemFrames: false,
      framesOmitted: null,
      registers: {},
      frames: [
        TestStubs.Frame({
          function: 'main',
          module: 'example.application',
          lineNo: 1,
          filename: 'application',
          platform: undefined,
        }),
        TestStubs.Frame({
          function: 'doThing',
          module: 'example.application',
          lineNo: 2,
          filename: 'application',
          platform: undefined,
        }),
      ],
    };

    it('renders java example', () => {
      expect(displayRawContent(data, 'java', exception)).toEqual(
        `example.application.Error: an error occurred
    at example.application.doThing(application:2)
    at example.application.main(application:1)`
      );
    });

    it('renders python example', () => {
      expect(displayRawContent(data, 'python', exception)).toEqual(
        `Error: an error occurred
  File "application", line 1, in main
  File "application", line 2, in doThing`
      );
    });
  });
});
