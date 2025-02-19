from datetime import datetime

from sentry.api.serializers import UserTagValueSerializer, serialize
from sentry.tagstore.types import TagValue
from sentry.testutils.cases import TestCase
from sentry.testutils.silo import region_silo_test


@region_silo_test(stable=True)
class TagValueSerializerTest(TestCase):
    def test_with_user(self):
        user = self.create_user()
        tagvalue = TagValue(
            key="sentry:user",
            value="username:ted",
            times_seen=1,
            first_seen=datetime(2018, 1, 1),
            last_seen=datetime(2018, 1, 1),
        )

        result = serialize(tagvalue, user)
        assert result["key"] == "user"
        assert result["value"] == "username:ted"
        assert result["name"] == "ted"
        assert result["query"] == 'user.username:"ted"'

    def test_release(self):
        user = self.create_user()
        tagvalue = TagValue(
            key="sentry:release",
            value="df84bccbb23ca15f2868be1f2a5f7c7a6464fadd",
            times_seen=1,
            first_seen=datetime(2018, 1, 1),
            last_seen=datetime(2018, 1, 1),
        )

        result = serialize(tagvalue, user)
        assert result["key"] == "release"
        assert result["value"] == "df84bccbb23ca15f2868be1f2a5f7c7a6464fadd"
        assert result["name"] == "df84bccbb23ca15f2868be1f2a5f7c7a6464fadd"
        assert "query" not in result


@region_silo_test(stable=True)
class UseTagValueSerializerTest(TestCase):
    def test_query(self):
        user = self.create_user()
        tagvalue = TagValue(
            key="sentry:user",
            value="username:ted",
            times_seen=1,
            first_seen=datetime(2018, 1, 1),
            last_seen=datetime(2018, 1, 1),
        )

        result = serialize(tagvalue, user, serializer=UserTagValueSerializer(project_id=1))
        assert result["value"] == "username:ted"
        assert result["query"] == 'user.username:"ted"'
