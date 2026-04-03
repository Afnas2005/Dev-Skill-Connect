const fs = require('fs');
const path = require('path');

const targetPath = 'C:\\Users\\Afnas\\OneDrive\\Desktop\\devskill-connect\\frontend\\src\\app\\messager\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const mappings = [
    ['bg-[#080d24]', 'bg-[var(--app-surface)]'],
    ['bg-[#0d1736]', 'bg-black/20'],
    ['bg-[#0f1a3b]', 'bg-[var(--app-surface-soft)]'],
    ['bg-[#16203e]', 'bg-[var(--app-surface-strong)]'],
    ['bg-[#1b2d57]', 'bg-[var(--app-line)]'],
    ['bg-[#2135ff]', 'bg-gradient-to-r from-[var(--app-primary)] to-[#38bdf8] text-white shadow-glow'],
    ['bg-[#2f62ff]', 'bg-[var(--app-primary-strong)]'],
    ['bg-[#ff3b3b]', 'bg-red-500/20 text-red-400'],
    ['bg-[#00e676]', 'bg-emerald-500/20 text-emerald-400'],
    ['bg-[#3b82f6]', 'bg-cyan-500/20 text-cyan-400'],
    
    ['border-[#16203e]', 'border-[var(--app-line)]'],
    ['border-[#1b2d57]', 'border-[var(--app-line-strong)]'],
    ['border-[#2f62ff]', 'border-[var(--app-primary)]'],
    
    ['text-[#74a6ff]', 'text-[var(--app-primary)]'],
    ['text-[#d7e6ff]', 'text-[var(--app-text)]'],
    ['text-[#5e75a4]', 'text-[var(--app-muted)]'],
    ['text-[#6780ad]', 'text-[var(--app-text-soft)]'],
    
    ['from-[#2f62ff]', 'from-[var(--app-primary)]'],
    ['to-[#638fff]', 'to-[#0ea5e9]'],
    ['shadow-[0_4px_20px_rgba(47,98,255,0.3)]', 'shadow-glow'],
    ['shadow-[0_0_20px_rgba(47,98,255,0.4)]', 'shadow-glow'],
    ['ring-[#2f62ff]/30', 'ring-[var(--app-primary)]/30'],

    ['hover:bg-[#0f1a3b]', 'hover:bg-[var(--app-surface-soft)]'],
    ['hover:bg-[#16203e]', 'hover:bg-[var(--app-surface-strong)]'],
    ['hover:text-[#2f62ff]', 'hover:text-[var(--app-primary-strong)]'],
    ['focus:border-[#2f62ff]', 'focus:border-[var(--app-primary)]'],
    ['focus:ring-[#2f62ff]/50', 'focus:ring-[var(--app-primary)]/50'],

    ['bg-[#10b981]', 'bg-[var(--app-success)]'],
    ['ring-[#10b981]', 'ring-[var(--app-success)]'],
];

let totalReplacements = 0;

mappings.forEach(([oldStr, newStr]) => {
    const regex = new RegExp(oldStr.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\//g, '\\/').replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g');
    const matches = content.match(regex);
    if (matches) {
        totalReplacements += matches.length;
        content = content.replace(regex, newStr);
    }
});

// Structural fixes
content = content.replace(/border-r border-\[var\(--app-line\)\] bg-\[var\(--app-surface\)\]/g, 'border-r border-[var(--app-line)] app-glass');
content = content.replace(/rounded-\[24px\] border border-\[var\(--app-line\)\] shadow-\[0_0_40px_rgba\(0,0,0,0.5\)\] app-glass/g, 'rounded-[28px] border border-[var(--app-line)] shadow-glow app-card overflow-hidden');
content = content.replace(/<div className="flex items-center gap-2">/g, '<div className="flex items-center gap-2 z-10 relative">'); // Keep header buttons above gradients

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully applied', totalReplacements, 'replacements!');
