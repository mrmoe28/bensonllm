# Interactive Code Preview System

## Overview
Benson can write HTML, JavaScript, React, and SVG code that will automatically display in an interactive preview panel. Users can see the code running live in a sandbox environment.

## Supported Languages

### ✅ Fully Interactive
- **HTML** - Full HTML documents or snippets (auto-wrapped with Tailwind CSS)
- **JavaScript** - Interactive JS with DOM manipulation
- **React/JSX** - React components with auto-setup
- **SVG** - Vector graphics and animations
- **Vue** - Vue.js components (coming soon)
- **Svelte** - Svelte components (coming soon)

## How to Use

### 1. Write Code in Markdown Code Blocks

Simply wrap your code in triple backticks with the language identifier:

\`\`\`html
<div class="bg-blue-500 text-white p-4 rounded-lg">
  <h1 class="text-2xl font-bold">Hello World!</h1>
  <button onclick="alert('Clicked!')" class="mt-2 px-4 py-2 bg-white text-blue-500 rounded">
    Click Me
  </button>
</div>
\`\`\`

### 2. Preview Automatically Opens

The preview panel will automatically open on the right side showing the interactive result.

### 3. Features

- **Preview/Code Toggle** - Switch between rendered output and source code
- **Copy** - Copy the code to clipboard
- **Download** - Download as an HTML file
- **Fullscreen** - View in fullscreen mode
- **Version History** - When code is updated, previous versions are saved

## Available Libraries

### Automatically Included

**HTML/JavaScript:**
- Tailwind CSS (for styling)
- Standard DOM APIs

**React:**
- React 18
- ReactDOM 18
- Babel (for JSX transformation)

**SVG:**
- Full SVG specification support
- CSS animations

## Code Examples

### Interactive Button Counter

\`\`\`html
<div id="app" class="text-center p-8">
  <h1 class="text-3xl font-bold mb-4">Counter</h1>
  <p class="text-6xl font-bold text-blue-600 mb-4" id="count">0</p>
  <button onclick="increment()" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
    Increment
  </button>
</div>

<script>
let count = 0;
function increment() {
  count++;
  document.getElementById('count').textContent = count;
}
</script>
\`\`\`

### Animated SVG

\`\`\`svg
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="#3b82f6">
    <animate attributeName="r" values="50;70;50" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="fill" values="#3b82f6;#ef4444;#3b82f6" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
\`\`\`

### React Component

\`\`\`react
function TodoApp() {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Add a todo..."
        />
        <button onClick={addTodo} className="px-4 py-2 bg-blue-500 text-white rounded">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="p-3 bg-gray-100 rounded">
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

const App = TodoApp;
\`\`\`

### Canvas Animation

\`\`\`html
<canvas id="canvas" width="600" height="400" class="border border-gray-300 rounded"></canvas>

<script>
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 50;
let y = 50;
let dx = 2;
let dy = 2;
const radius = 20;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#3b82f6';
  ctx.fill();
  ctx.closePath();

  if (x + dx > canvas.width - radius || x + dx < radius) {
    dx = -dx;
  }
  if (y + dy > canvas.height - radius || y + dy < radius) {
    dy = -dy;
  }

  x += dx;
  y += dy;
}

setInterval(draw, 10);
</script>
\`\`\`

## Best Practices

### 1. Use Semantic Language Tags
Always specify the language in code blocks:
- ✅ \`\`\`html
- ✅ \`\`\`javascript
- ✅ \`\`\`react
- ❌ \`\`\` (generic)

### 2. Include Complete Examples
For HTML, include both structure and interactivity:
```html
<!-- Structure -->
<div id="app">...</div>

<!-- Interactivity -->
<script>
  // Your JavaScript here
</script>
```

### 3. Leverage Tailwind CSS
Tailwind is automatically available - use it for quick styling:
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Styled Button
</button>
```

### 4. Keep Code Self-Contained
The preview runs in a sandboxed iframe - keep everything in one code block.

### 5. Test Interactivity
When writing interactive code, include examples of:
- Event handlers (onclick, onChange, etc.)
- State management
- Animations
- User feedback

## Limitations

### Security Sandbox
- Runs in iframe with `sandbox="allow-scripts allow-same-origin"`
- Cannot access parent window or make external API calls without CORS
- localStorage is scoped to the iframe

### No Backend
- Pure frontend code only
- No server-side execution
- Use mock data for demonstrations

### External Resources
- Can load CDN resources (like Tailwind)
- Images must be from external URLs or base64
- Fonts from Google Fonts or system fonts

## Tips for Creating Great Previews

1. **Add Comments** - Explain what the code does
2. **Use Colors** - Make it visually appealing with Tailwind
3. **Make it Interactive** - Add buttons, inputs, animations
4. **Show State** - Demonstrate state changes visibly
5. **Keep it Simple** - One focused example per artifact
6. **Test Edge Cases** - Show error handling when relevant

## System Prompt Recommendation

When Benson creates code that should be previewed, he should:

1. **Announce it**: "I'll create an interactive [type] for you..."
2. **Use proper language tags**: Always specify html, javascript, react, svg
3. **Make it complete**: Include all necessary HTML, CSS, and JS
4. **Make it interactive**: Add user interaction when possible
5. **Explain it**: Briefly describe what the code does after the block

Example response pattern:
```
I'll create an interactive counter for you:

[code block here]

This counter uses JavaScript to increment a value when you click the button. It's styled with Tailwind CSS for a modern look.
```

---

**This system is live and ready to use!** Just write code in markdown blocks and it will automatically preview.
