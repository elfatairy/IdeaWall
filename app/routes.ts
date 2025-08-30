import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/whiteboard.tsx'),
  route('/.well-known/appspecific/com.chrome.devtools.json', 'routes/[com.chrome.devtools.json].tsx')
] satisfies RouteConfig
