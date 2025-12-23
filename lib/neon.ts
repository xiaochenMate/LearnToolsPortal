
import { neon } from '@neondatabase/serverless';

// Netlify 会自动注入 NETLIFY_DATABASE_URL 环境变量
const sql = neon(process.env.NETLIFY_DATABASE_URL || '');

export default sql;
