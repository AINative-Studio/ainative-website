/**
 * Teal Accent Color Test Component - Issue #372
 *
 * This component tests all teal accent utilities to verify they work correctly.
 * To test: Import this component in any page and render it.
 */

export default function TealAccentTest() {
  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Teal Accent Color Tests - Issue #372</h1>

      {/* Background Tests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Background Colors</h2>
        <div className="space-y-4">
          <div className="bg-ainative-teal text-white p-6 rounded-lg">
            <p className="font-semibold">bg-ainative-teal</p>
            <p className="text-sm opacity-90">#22BCDE</p>
          </div>
          <div className="bg-accent-secondary text-white p-6 rounded-lg">
            <p className="font-semibold">bg-accent-secondary</p>
            <p className="text-sm opacity-90">#22BCDE</p>
          </div>
        </div>
      </section>

      {/* Text Color Tests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Text Colors</h2>
        <div className="space-y-2">
          <p className="text-ainative-teal text-2xl font-bold">
            text-ainative-teal - Large heading
          </p>
          <p className="text-accent-secondary text-lg">
            text-accent-secondary - Body text
          </p>
        </div>
      </section>

      {/* Border Tests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Border Colors</h2>
        <div className="space-y-4">
          <div className="border-4 border-ainative-teal p-6 rounded-lg">
            <p className="font-semibold">border-ainative-teal</p>
            <p className="text-sm text-gray-600">4px solid border</p>
          </div>
          <div className="border-2 border-accent-secondary p-6 rounded-lg">
            <p className="font-semibold">border-accent-secondary</p>
            <p className="text-sm text-gray-600">2px solid border</p>
          </div>
        </div>
      </section>

      {/* Hover States */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Interactive Elements</h2>
        <div className="space-y-4">
          <button className="bg-ainative-teal text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all">
            Hover over me (bg-ainative-teal)
          </button>
          <button className="bg-gray-100 text-accent-secondary px-6 py-3 rounded-lg hover:bg-accent-secondary hover:text-white transition-all">
            Hover to change (hover:bg-accent-secondary)
          </button>
          <a href="#" className="text-accent-secondary hover:underline text-lg block">
            Interactive link (text-accent-secondary)
          </a>
        </div>
      </section>

      {/* Badge Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Badges and Tags</h2>
        <div className="flex gap-3 flex-wrap">
          <span className="bg-ainative-teal text-white px-4 py-2 rounded-full text-sm font-semibold">
            New Feature
          </span>
          <span className="bg-accent-secondary text-white px-4 py-2 rounded-full text-sm font-semibold">
            In Progress
          </span>
          <span className="border-2 border-ainative-teal text-ainative-teal px-4 py-2 rounded-full text-sm font-semibold">
            Outlined Badge
          </span>
        </div>
      </section>

      {/* Dark Background Test */}
      <section className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">On Dark Background</h2>
        <div className="space-y-4">
          <p className="text-ainative-teal text-lg">
            Teal text on dark background (accessibility check)
          </p>
          <button className="bg-accent-secondary text-white px-6 py-3 rounded-lg hover:bg-opacity-90">
            Teal button on dark
          </button>
        </div>
      </section>

      {/* Gradient Examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Gradient Effects</h2>
        <div className="space-y-4">
          <div
            className="p-6 rounded-lg text-white"
            style={{ background: 'linear-gradient(135deg, #4B6FED 0%, #22BCDE 100%)' }}
          >
            <p className="font-semibold">Blue to Teal Gradient</p>
            <p className="text-sm opacity-90">Primary Blue → Teal Accent</p>
          </div>
          <div
            className="p-6 rounded-lg text-white"
            style={{ background: 'linear-gradient(135deg, #22BCDE 0%, #8A63F4 100%)' }}
          >
            <p className="font-semibold">Teal to Purple Gradient</p>
            <p className="text-sm opacity-90">Teal Accent → Purple Accent</p>
          </div>
        </div>
      </section>

      {/* Status Message */}
      <section className="mt-8 p-6 border-l-4 border-ainative-teal bg-gray-50 rounded">
        <h3 className="text-lg font-semibold text-ainative-teal mb-2">
          All Teal Accent Tests Rendered
        </h3>
        <p className="text-gray-700">
          If you can see this section with a teal left border, all utilities are working correctly.
        </p>
      </section>
    </div>
  );
}
