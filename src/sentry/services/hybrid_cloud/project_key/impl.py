from typing import Optional

from django.db.models import F

from sentry.services.hybrid_cloud.project_key import (
    ProjectKeyRole,
    ProjectKeyService,
    RpcProjectKey,
)


class DatabaseBackedProjectKeyService(ProjectKeyService):
    def _get_project_key(self, project_id: str, role: ProjectKeyRole) -> Optional[RpcProjectKey]:
        from sentry.models.projectkey import ProjectKey

        project_keys = ProjectKey.objects.filter(
            project=project_id, roles=F("roles").bitor(role.as_orm_role())
        )

        if project_keys:
            return RpcProjectKey(dsn_public=project_keys[0].dsn_public)

        return None

    def get_project_key(
        self, organization_id: int, project_id: str, role: ProjectKeyRole
    ) -> Optional[RpcProjectKey]:
        return self._get_project_key(project_id=project_id, role=role)

    def get_project_key_by_region(
        self, *, region_name: str, project_id: str, role: ProjectKeyRole
    ) -> Optional[RpcProjectKey]:
        return self._get_project_key(project_id=project_id, role=role)
