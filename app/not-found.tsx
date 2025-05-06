export default function NotFound() {
  return (
    <html>
      <head>
        <title>Page Not Found</title>
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
          header {
            border-bottom: 1px solid #333;
            padding: 1rem;
            display: flex;
            align-items: center;
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: bold;
            font-size: 1.25rem;
            text-decoration: none;
            color: #fff;
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
          .home-link {
            display: inline-block;
            background-color: #e11d48;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
          }
          .home-link:hover {
            background-color: #be123c;
          }
          .heart-icon {
            color: #e11d48;
            width: 1.5rem;
            height: 1.5rem;
          }
          .heart-icon-large {
            color: #e11d48;
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
          }
        `,
          }}
        />
      </head>
      <body>
        <header>
          <a href="/" className="logo">
            <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1112 6.006a5 5 0 117.5 6.572z" />
            </svg>
            <span>HeartPredict</span>
          </a>
        </header>

        <main>
          <div className="content">
            <svg
              className="heart-icon-large"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1112 6.006a5 5 0 117.5 6.572z" />
            </svg>
            <h1>Page Not Found</h1>
            <p>Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.</p>
            <a href="/" className="home-link">
              Return to Home
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
