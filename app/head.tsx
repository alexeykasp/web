export default function Head() {
  return (
    <>
      <title>alexeykasp</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      {/* Можно добавить fallback для браузеров, которые не поддерживают svg */}
      <link rel="alternate icon" href="/favicon.ico" />
      <meta name="description" content="BIO" />
    </>
  );
}
