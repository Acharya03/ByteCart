import Header from '../shared/widgets/header';
import './global.css';

export const metadata = {
	title: 'ByteCart',
	description: 'ByteCart',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<Header/>
				{children}
			</body>
		</html>
	)
}
