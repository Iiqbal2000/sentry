import {Organization} from 'sentry-fixture/organization';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import ErrorCounts from 'sentry/components/replays/header/errorCounts';
import useProjects from 'sentry/utils/useProjects';

jest.mock('sentry/utils/useProjects');

const replayRecord = TestStubs.ReplayRecord();
const organization = Organization({});

describe('ErrorCounts', () => {
  beforeEach(() => {
    jest.mocked(useProjects).mockReturnValue({
      fetching: false,
      projects: [
        TestStubs.Project({
          id: replayRecord.project_id,
          slug: 'my-js-app',
          platform: 'javascript',
        }),
        TestStubs.Project({
          id: '123123123',
          slug: 'my-py-backend',
          platform: 'python',
        }),
        TestStubs.Project({
          id: '234234234',
          slug: 'my-node-service',
          platform: 'node',
        }),
      ],
      fetchError: null,
      hasMore: false,
      initiallyLoaded: true,
      onSearch: () => Promise.resolve(),
      placeholders: [],
    });
  });

  it('should render 0 when there are no errors in the array', async () => {
    const errors = [];

    render(<ErrorCounts replayErrors={errors} replayRecord={replayRecord} />, {
      organization,
    });
    const countNode = await screen.getByLabelText('number of errors');
    expect(countNode).toHaveTextContent('0');
  });

  it('should render an icon & count when all errors come from a single project', async () => {
    const errors = [TestStubs.ReplayError({'project.name': 'my-js-app'})];

    render(<ErrorCounts replayErrors={errors} replayRecord={replayRecord} />, {
      organization,
    });

    const countNode = await screen.getByLabelText('number of errors');
    expect(countNode).toHaveTextContent('1');

    const icon = await screen.findByTestId('platform-icon-javascript');
    expect(icon).toBeInTheDocument();

    expect(countNode.parentElement).toHaveAttribute(
      'href',
      '/mock-pathname/?f_e_project=my-js-app&t_main=errors'
    );
  });

  it('should render an icon & count with links when there are errors in two unique projects', async () => {
    const errors = [
      TestStubs.ReplayError({'project.name': 'my-js-app'}),
      TestStubs.ReplayError({'project.name': 'my-py-backend'}),
      TestStubs.ReplayError({'project.name': 'my-py-backend'}),
    ];

    render(<ErrorCounts replayErrors={errors} replayRecord={replayRecord} />, {
      organization,
    });

    const countNodes = await screen.getAllByLabelText('number of errors');
    expect(countNodes[0]).toHaveTextContent('1');
    expect(countNodes[1]).toHaveTextContent('2');

    const jsIcon = await screen.findByTestId('platform-icon-javascript');
    expect(jsIcon).toBeInTheDocument();
    const pyIcon = await screen.findByTestId('platform-icon-python');
    expect(pyIcon).toBeInTheDocument();

    expect(countNodes[0].parentElement).toHaveAttribute(
      'href',
      '/mock-pathname/?f_e_project=my-js-app&t_main=errors'
    );
    expect(countNodes[1].parentElement).toHaveAttribute(
      'href',
      '/mock-pathname/?f_e_project=my-py-backend&t_main=errors'
    );
  });

  it('should render multiple icons, but a single count and link, when there are errors in three or more projects', async () => {
    const errors = [
      TestStubs.ReplayError({'project.name': 'my-js-app'}),
      TestStubs.ReplayError({'project.name': 'my-py-backend'}),
      TestStubs.ReplayError({'project.name': 'my-py-backend'}),
      TestStubs.ReplayError({'project.name': 'my-node-service'}),
      TestStubs.ReplayError({'project.name': 'my-node-service'}),
      TestStubs.ReplayError({'project.name': 'my-node-service'}),
    ];

    render(<ErrorCounts replayErrors={errors} replayRecord={replayRecord} />, {
      organization,
    });

    const countNode = await screen.getByLabelText('total errors');
    expect(countNode).toHaveTextContent('6');

    const jsIcon = await screen.findByTestId('platform-icon-javascript');
    expect(jsIcon).toBeInTheDocument();

    const pyIcon = await screen.findByTestId('platform-icon-python');
    expect(pyIcon).toBeInTheDocument();

    const plusOne = await screen.getByLabelText('hidden projects');
    expect(plusOne).toHaveTextContent('+1');

    expect(countNode.parentElement).toHaveAttribute(
      'href',
      '/mock-pathname/?t_main=errors'
    );
  });
});
