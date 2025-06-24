import express from 'express';
import cors from 'cors';


const app = express();

app.use(
	cors({
		origin: ["https://localhost:3000"],
		allowedHeaders: ['Authorization', 'Content-Type'],
		credentials: true,
	}),
);

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API my friend'});
});

const port = process.env.PORT || 6001;

const server = app.listen(port, () => {
    console.log(`Auth Service is running on http://localhost:${port}/api`);
});

server.on("error", (err) => {
    console.log("server error", err);
})
