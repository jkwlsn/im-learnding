# What is API Gateway?

According to the documentation...

> "[Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) is an AWS service for creating, publishing, maintaining, monitoring, and securing REST, HTTP, and WebSocket APIs at any scale."

There are three main features of API Gateway (AGW):
1. Serverless HTTPS
2. Reverse Proxy
3. Data transformation etc.

That means:
1. Applications need to handle TLS traffic, however if you don't have a server, how do you do that? AGW provides a way to interact with TLS traffic without a server.
2. AGW serves as a the front to link all your other services and stuff together. In this way, it's like routes in Python Flask.
3. If you have a server, you can handle cashes, firewall, rate limit, etc, AGW provides the same features in a serverless environment.
4. It also provides a nice interface for all this, which improves the experience for developers. As one reddit questioner wrote, it's like a charcuterie board of micro services, thin slices collected together and presented nicely.
