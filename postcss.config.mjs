// Tailwind CSS は Next.js 公式ドキュメントどおり PostCSS 経由で読み込む。
// (テンプレートの @tailwindcss/turbopack ローダーは、別プロジェクトで next dev が
//  リロードを繰り返す不具合を起こしたため使わない)
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
