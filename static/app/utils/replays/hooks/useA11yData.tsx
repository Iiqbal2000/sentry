import {useReplayContext} from 'sentry/components/replays/replayContext';
import {useApiQuery} from 'sentry/utils/queryClient';
import hydrateA11yIssue, {A11yIssue} from 'sentry/utils/replays/hydrateA11yRecord';
import useOrganization from 'sentry/utils/useOrganization';
import useProjects from 'sentry/utils/useProjects';

export default function useA11yData() {
  const organization = useOrganization();
  const {replay} = useReplayContext();
  const {projects} = useProjects();

  const replayRecord = replay?.getReplay();
  const startTimestampMs = replayRecord?.started_at.getTime();
  const project = projects.find(p => p.id === replayRecord?.project_id);

  const {data} = useApiQuery<A11yIssue[]>(
    [
      `/projects/${organization.slug}/${project?.slug}/replays/${replayRecord?.id}/accessibility-issues/`,
    ],
    {
      staleTime: 0,
      enabled: Boolean(project) && Boolean(replayRecord),
    }
  );

  if (project && replayRecord && startTimestampMs) {
    return data?.map(record => hydrateA11yIssue(record, startTimestampMs));
  }
  return [];
}
