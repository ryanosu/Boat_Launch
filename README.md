# Boat Launch Web App!

![oAuth2](https://github.com/ryanosu/Boat_Launch/assets/86269596/c0317df8-6a95-4c5b-8b79-acc38a1e2e4e)

Create an account and login using OAuth2

![chrome_tPofu6trER](https://github.com/ryanosu/Boat_Launch/assets/86269596/9507fa8c-ee28-4307-b524-a3ad12cd2071)

Pick a boat and confirm your intent to rent it! Press Cancel to undo your order.

![chrome_rBKqHMVFsG](https://github.com/ryanosu/Boat_Launch/assets/86269596/0854d6b0-76d3-442f-910d-e5fb807b35f9)

Press the arrow keys to move your boat and collect the gold coins

<h2>About</h2>
This app allows the user to rent a boat - a tube, kayak, or canoe. <br> <br> Upon confirmation, the number of that particular boat decrements. If the user then presses Cancel, the number of that particular boat in stock will increment. <br> <br> 
A user may use the arrow keys on their keyboard to move the kayak around the ocean and collect the dispersed gold coins.

<h2>Technologies:</h2>
<li>Backend: Express, Google Cloud Platform's NoSQL Datastore</li>
<li>Frontend: JavaScript, Three.js, HTML, CSS</li>
<li>Other: Google Cloud Platform, OAuth2, OpenID-Connect, Auth0</li>

<h2>How to use:</h2>

1. Clone this repository

```sh
https://github.com/ryanosu/Boat_Launch.git
```

2. Set proper configurations
   
3. Run the app

```sh
node index.js
```

<h2>Or view mine live on Google Cloud Platform:</h2>

```sh
https://paprockr-project.uc.r.appspot.com/
```
<h2>Todo:</h2>

- [ ] Enable any boat to be able to move via keyboard arrow keys
- [ ] After a user confirms their rental, remove the arrow and focus the camera on that boat
- [ ] Add a counter graphic for the number of coins collected
- [ ] Add background music
- [ ] Add a sound when a coin is collected
