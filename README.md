# StatsOfOrigin - State of Origin Visualiser

**3d Visualiser for the State of Origin as used on [StatsOfOrigin.com](http://www.statsoforigin.com) (originally OriginStats.com)**

### Calling for collaborators on this free open source project

Looking for any interested Designers / Developers to help collaborate on this open source project. It would help if you were good (Qlder) but any level of talent (NSW have lots, just lacking in results department) would be appreciated.

Specifically after:

- developers with interest in data/dataviz/databases/SQL
- designers who want to own the overall look and feel

## StatsOfOrigin is

All games from 1982. Currently renders out series wins, matches within series wins and total points scored.

Built with [Three JS](http://threejs.org/) using WebGL. There is also a SVG renderer built with [d3](http://d3js.org/) which is a fallback if WebGL is not available.

There is a /bot folder which was an attempt at playing with twitter interactions and all that kind of jazz.
Uses [TwitterSocialBot](https://github.com/raurir/TwitterSocialBot)

PS. Maroon rhymes with moon, not moan. - reference Maurice Dwyer.

## Developing

```
mkdir deploy
yarn build
yarn develop
yarn server
```

### DO use `localdev.html` when developing!!
