
import { neon } from '@neondatabase/serverless';

const getDatabaseUrl = (): string => {
  try {
    // 优先级 1: 用户手动配置的 VITE_ 变量 (推荐)
    // @ts-ignore
    const viteVar = import.meta.env?.VITE_DATABASE_URL;
    if (viteVar) return viteVar;

    // 优先级 2: Netlify Neon 插件自动注入的变量 (某些构建阶段可用)
    // @ts-ignore
    const netlifyNeon = import.meta.env?.DATABASE_URL || import.meta.env?.NETLIFY_DATABASE_URL;
    if (netlifyNeon) return netlifyNeon;

    // 优先级 3: 后备 process.env (Node 预处理阶段)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.VITE_DATABASE_URL || process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || '';
    }
  } catch (e) {
    console.warn("[Neon] Failed to access environment variables:", e);
  }
  return '';
};

const dbUrl = getDatabaseUrl();

// 初始化连接
export const sql = dbUrl ? neon(dbUrl) : null;

if (!sql) {
  console.warn("[Neon] Database connection string not found. Using local library fallback.");
}

export default sql;
