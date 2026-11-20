import { nodeAdapter } from '../../server/http';
import { enrollmentGet } from '../../server/authHandlers';

export default nodeAdapter(() => enrollmentGet());