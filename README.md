![plovers-image](https://github.com/jwoogerd/plovers/blob/master/plovers.png)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Plovers models transactions as flocking birds. Heavily inspired by 
this [2D example](https://p5js.org/examples/simulate-flocking.html) and
[this website](http://www.red3d.com/cwr/boids/).

Boid color and size are parameterized by the given transaction's `category_id` and `amount`, respectively.

### Installing dependencies

`cd server && npm install`   
`cd client && npm install`

### To run

Make sure the following environment variables are set:

```
export PLAID_CLIENT_ID=<your-plaid-client-id>
export PLAID_PUBLIC_KEY=<your-plaid-public-key>
export PLAID_SECRET=<your-plaid-secret>
export PLAID_ENV=<sandbox OR development OR production>
```

#### Run the server
`cd server`   
`npm start`

#### Run the client
`cd client`   
`npm start`

Open [http://localhost:3030](http://localhost:3030) to view it in the browser.
