
import { neon } from '@neondatabase/serverless';

const getDatabaseUrl = (): string => {
  try {
    /**
     * 在 Vite 项目中，环境变量必须以 VITE_ 开头
     * 且通过 import.meta.env 访问
     */
    // @ts-ignore
    const viteVar = import.meta.env?.VITE_DATABASE_URL;
    if (viteVar) return viteVar;

    /**
     * 如果用户没有配置 VITE_ 前缀，尝试读取插件可能注入的默认变量
     * 注意：某些插件可能不会自动将变量暴露给客户端，除非以 VITE_ 开头
     */
    // @ts-ignore
    const dbUrl = import.meta.env?.DATABASE_URL || import.meta.env?.NETLIFY_DATABASE_URL;
    if (dbUrl) return dbUrl;

  } catch (e) {
    console.warn("[Neon] Environment access restricted:", e);
  }
  return '';
};

const url = getDatabaseUrl();

// 导出 sql 实例，如果 URL 缺失则为 null
export const sql = url ? neon(url) : null;

if (!sql) {
  console.info("[Neon] No database URL found. App will use local poem library.");
}

export default sql;
