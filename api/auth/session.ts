import { nodeAdapter } from '../../server/http';
import { sessionGet } from '../../server/authHandlers';

export default nodeAdapter((request) => Promise.resolve(sessionGet(request)));