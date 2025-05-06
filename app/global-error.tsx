"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <head>
        <title>Something went wrong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #000;
            color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          main {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            text-align: center;
          }
          .content {
            max-width: 28rem;
            margin: 0 auto;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          p {
            color: #999;
            margin-bottom: 2rem;
          }
          button {
            background-color: #e11d48;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: none;
            font-weight: 500;
            cursor: pointer;
            margin-right: 0.5rem;
          }
          button:hover {
            background-color: #be123c;
          }
          a {
            display: inline-block;
            background-color: #333;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            background-color: #444;
          }
          .button-group {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }
        `,
          }}
        />
      </head>
      <body>
        <main>
          <div className="content">
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. Please try again or return to the home page.</p>
            <div className="button-group">
              <button onClick={() => reset()}>Try again</button>
              <a href="/">Return home</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
