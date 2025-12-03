import './globals.css'

export const metadata = {
  title: 'Reminder App - Never Forget Important Tasks',
  description: 'A powerful reminder application to help you stay organized and never miss important events',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}