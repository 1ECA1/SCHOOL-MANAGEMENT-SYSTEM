from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = "Set admin1 as a Super Admin"

    def handle(self, *args, **options):
        try:
            user = User.objects.get(username="admin1")
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("User admin1 does not exist.")
            )
            return

        user.role = User.Role.SUPER_ADMIN
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(
            update_fields=[
                "role",
                "is_active",
                "is_staff",
                "is_superuser",
            ]
        )

        self.stdout.write(
            self.style.SUCCESS("admin1 is now SUPER_ADMIN.")
        )
