# 🔒 JSGuard

A powerful, **semi-open source** JavaScript library that **protects** and **obfuscates** your JavaScript code from theft and inspection.

---

## ✨ Features

- 🔐 **Advanced JS Obfuscation** - Multi-layer code protection & encoding
- 🌐 **Domain Lock** - Restrict code execution to specific domains only
- ⚡ **Code Optimization** - Maintains functionality while securing code
- 🎯 **Easy Integration** - Simple API, just one function call
- 📦 **No Dependencies** - Works standalone (dynamically loads obfuscator)

---

## 📦 Installation

Add the library to your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/worm0x1/JSGuard/JSGuard.js"></script>
```

That's it! The library will automatically load all required dependencies.

---

## 🎮 Live Demo

### Demo 1: No Domain Lock

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS Protector - No Domain Lock</title>
    <script src="https://cdn.jsdelivr.net/gh/worm0x1/JSGuard/JSGuard.js"></script>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        textarea { width: 100%; height: 150px; padding: 10px; margin: 10px 0; font-family: monospace; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <textarea id="input" placeholder="Enter JavaScript code...">function greet(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome!';
}

greet('World');</textarea>
    <button onclick="protect()">Protect JavaScript</button>
    <textarea id="output" placeholder="Protected code will appear here..." readonly></textarea>

    <script>
        function protect() {
            const js = document.getElementById('input').value;
            JSProtector.protect(js)
                .then(code => document.getElementById('output').value = code)
                .catch(err => alert('Error: ' + err.message));
        }
    </script>
</body>
</html>
```

### Demo 2: With Domain Lock

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS Protector - Domain Lock</title>
    <script src="https://cdn.jsdelivr.net/gh/worm0x1/JSGuard/JSGuard.js"></script>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        input, textarea { width: 100%; padding: 10px; margin: 10px 0; font-family: monospace; }
        textarea { height: 150px; }
        button { padding: 10px 20px; background: #2196F3; color: white; border: none; cursor: pointer; }
        button:hover { background: #0b7dda; }
    </style>
</head>
<body>
    <textarea id="input" placeholder="Enter JavaScript code...">function greet(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome!';
}

greet('World');</textarea>
    <input type="text" id="domain" placeholder="Enter domain (e.g., example.com)">
    <button onclick="protect()">Protect JavaScript (Domain Lock)</button>
    <textarea id="output" placeholder="Protected code will appear here..." readonly></textarea>

    <script>
        function protect() {
            const js = document.getElementById('input').value;
            const domain = document.getElementById('domain').value;
            if (!domain) return alert('Please enter a domain!');
            
            JSProtector.protect(js, { lockToDomain: domain })
                .then(code => document.getElementById('output').value = code)
                .catch(err => alert('Error: ' + err.message));
        }
    </script>
</body>
</html>
```
---

## 📚 API Reference

### `JSProtector.protect(jsCode, options)`

Protects and obfuscates JavaScript code.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `jsCode` | String | ✅ Yes | Your JavaScript code to protect |
| `options` | Object | ❌ No | Configuration options |

#### Options Object

```javascript
{
    lockToDomain: String | Array  // Domain(s) to lock the JavaScript to
}
```

#### Supported Domain Formats

All formats are automatically normalized:

```javascript
'example.com'                    // ✅ Clean domain
'www.example.com'                // ✅ With www
'https://example.com'            // ✅ With protocol
'http://example.com'             // ✅ HTTP protocol
'example.com/'                   // ✅ With trailing slash
'https://www.example.com/path'   // ✅ With path
```

#### Return Value

Returns a `Promise` that resolves with the protected JavaScript code (string).

#### Usage Examples

```javascript
// Single domain
JSProtector.protect(jsCode, { 
    lockToDomain: 'example.com' 
});

// Multiple domains
JSProtector.protect(jsCode, { 
    lockToDomain: ['example.com', 'subdomain.example.com', 'another.com'] 
});

// No domain lock
JSProtector.protect(jsCode);
```

---

## 🌐 Domain Lock Feature

### How It Works

When domain lock is enabled:
1. The protected JavaScript checks the current domain
2. Compares against allowed domain(s)
3. Only executes if domain matches
4. Shows error message if domain doesn't match

### Domain Matching Rules

- **www handling**: Both `example.com` and `www.example.com` are treated as the same
- **Subdomain support**: `blog.example.com` is different from `example.com`
- **Protocol agnostic**: Works with both HTTP and HTTPS
- **Path independent**: Works on any page of the domain

### Examples

```javascript
// Single domain
lockToDomain: 'mywebsite.com'
// ✅ Works on: mywebsite.com, www.mywebsite.com
// ❌ Blocked on: blog.mywebsite.com, other.com

// Multiple domains
lockToDomain: ['site1.com', 'site2.com', 'blog.site1.com']
// ✅ Works on all three domains
// ❌ Blocked on any other domain

// Subdomain specific
lockToDomain: 'blog.example.com'
// ✅ Works on: blog.example.com
// ❌ Blocked on: example.com, shop.example.com
```

---

## 💡 Best Practices

### 1. Development vs Production

```javascript
const isDev = window.location.hostname === 'localhost' || 
              window.location.hostname === '127.0.0.1';

const options = isDev ? {} : { 
    lockToDomain: 'production-domain.com' 
};

JSProtector.protect(jsCode, options)
    .then(code => eval(code));
```

### 2. Error Handling

```javascript
JSProtector.protect(jsCode, options)
    .then(protectedCode => {
        eval(protectedCode);
        console.log('✅ JavaScript protection successful');
    })
    .catch(error => {
        console.error('❌ Protection failed:', error);
        // Fallback: execute code normally
        eval(jsCode);
    });
```

### 3. Large JavaScript Files

For very large JavaScript files, consider:
- Splitting into multiple smaller modules
- Loading critical code first
- Using async/defer for non-critical scripts

```javascript
// Critical JavaScript (protect and load immediately)
JSProtector.protect(criticalJS)
    .then(code => eval(code));

// Non-critical JavaScript (protect and load after page load)
window.addEventListener('load', () => {
    JSProtector.protect(nonCriticalJS)
        .then(code => eval(code));
});
```

### 4. Multiple JavaScript Files

```javascript
const jsFiles = {
    core: `/* core JavaScript */`,
    utils: `/* utility functions */`,
    components: `/* component logic */`
};

Promise.all([
    JSProtector.protect(jsFiles.core, options),
    JSProtector.protect(jsFiles.utils, options),
    JSProtector.protect(jsFiles.components, options)
])
    .then(protectedCodes => {
        protectedCodes.forEach(code => eval(code));
    });
```

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| JavaScript not executing | Check browser console for errors |
| Domain lock not working | Verify domain format is correct |
| Works on localhost but not production | Remove domain lock for localhost testing |
| Library not loading | Check CDN URL and internet connection |
| Protected code too large | Consider splitting JavaScript into smaller chunks |

### Debug Mode

```javascript
JSProtector.protect(jsCode, options)
    .then(code => {
        console.log('Protected code length:', code.length);
        console.log('Original JavaScript length:', jsCode.length);
        eval(code);
    })
    .catch(error => {
        console.error('Error details:', error);
        console.error('JavaScript input:', jsCode);
        console.error('Options:', options);
    });
```

### Checking If Protection Is Active

```javascript

// Check in console:
console.log('JSProtector loaded:', typeof JSProtector !== 'undefined');
```

---

## ⚙️ static web protection

This project is also built with the same **Js obfuscation library**

> [▶️ Test Site](https://web0x1.vercel.app/)


---

## 📄 License

License - **Free** to use in personal and commercial projects

---
