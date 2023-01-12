// Unit tests
import './unit/lib/enums/unit.lib.enums';
import './unit/lib/utils/unit.lib.utility.hash';
import './unit/lib/utils/unit.lib.utility.helpers';
import './unit/middlewares/unit.middlewares.auth';
import './unit/middlewares/unit.middlewares.model';
import './unit/middlewares/unit.middlewares.user';
import './unit/controllers/unit.controllers.auth';
import './unit/controllers/unit.controllers.user';
import './unit/admin/middlewares/unit.admin.middlewares.auth';
import './unit/admin/middlewares/unit.admin.middlewares.roles';
import './unit/admin/middlewares/unit.admin.middlewares.admin';
import './unit/admin/controllers/unit.admin.controllers.auth';
import './unit/admin/controllers/unit.admin.controllers.roles';
import './unit/admin/lib/utils/unit.admin.lib.utility.hash';
import './unit/admin/lib/utils/unit.admin.lib.utility.helpers';

// Integration test
import './integration/integration.welcome';
import './integration/integration.auth';
import './integration/integration.user';
import './integration/admin/integration.admin.auth';
import './integration/admin/integration.admin.roles';
import './integration/admin/integration.admin';
