import "./index.css";
import shark from "./assets/shark.jpg";

function App() {
  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">≋</div>
          <div>
            <h2>MARINE AI</h2>
            <span>Ocean Intelligence</span>
          </div>
        </div>

        <button className="new-chat">
          <span>＋</span> New conversation
        </button>

        <div className="side-section">
          <p className="side-label">WORKSPACE</p>

          <div className="side-item active">
            <span>▣</span> Marine Assistant
          </div>

          <div className="side-item">
            <span>⌖</span> Observation Map
          </div>

          <div className="side-item">
            <span>◇</span> Marine Alerts
          </div>

          <div className="side-item">
            <span>◈</span> Fishing Zones
          </div>

          <div className="side-item">
            <span>▤</span> Data Explorer
          </div>
        </div>

        <div className="side-section recent">
          <p className="side-label">RECENT CONVERSATIONS</p>

          <div className="recent-item">
            <strong>Arabian Sea conditions</strong>
            <small>12:42 PM</small>
          </div>

          <div className="recent-item">
            <strong>PFZ analysis</strong>
            <small>Yesterday</small>
          </div>

          <div className="recent-item">
            <strong>Coastal weather</strong>
            <small>May 22</small>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <span>Marine systems operational</span>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* HEADER */}
        <header className="topbar">
          <div className="assistant-title">
            <div className="shark-avatar">
              <img src={shark} alt="Marine AI shark" />
            </div>

            <div>
              <h1>Marine AI Assistant</h1>
              <p>Conversational ocean intelligence</p>
            </div>
          </div>

          <div className="top-actions">
            <button className="location">⌖ Arabian Sea⌄</button>
            <div className="live">
              <span></span> Live data
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content">
          {/* CHAT */}
          <section className="chat-panel">
            <div className="chat-header">
              <div>
                <span className="eyebrow">MARINE INTELLIGENCE</span>
                <h2>Ask anything about the ocean</h2>
              </div>

              <div className="online">
                <span></span> Online
              </div>
            </div>

            <div className="messages">
              <div className="message-row">
                <div className="mini-shark">
                  <img src={shark} alt="" />
                </div>

                <div className="message-block">
                  <div className="message-name">Marine AI</div>

                  <div className="bubble">
                    Hello! I'm Marine AI. I can help you understand ocean
                    conditions, weather, satellite observations, fishing zones
                    and marine safety.
                  </div>

                  <span className="time">12:42 PM</span>
                </div>
              </div>

              <div className="message-row">
                <div className="mini-shark">
                  <img src={shark} alt="" />
                </div>

                <div className="message-block">
                  <div className="message-name">Marine AI</div>

                  <div className="bubble analysis-bubble">
                    <p>
                      I can correlate marine observations to help you make
                      better operational decisions.
                    </p>

                    <div className="condition-grid">
                      <div>
                        <span>◌ Wind</span>
                        <strong>12–16 km/h</strong>
                        <small>Moderate</small>
                      </div>

                      <div>
                        <span>〰 Wave height</span>
                        <strong>1.0–1.4 m</strong>
                        <small>Normal</small>
                      </div>

                      <div>
                        <span>☁ Weather</span>
                        <strong>Partly cloudy</strong>
                        <small>No severe alerts</small>
                      </div>

                      <div>
                        <span>◉ Visibility</span>
                        <strong>Good</strong>
                        <small>Stable</small>
                      </div>
                    </div>

                    <div className="warning">
                      Always verify the latest official marine advisory before
                      departure.
                    </div>

                    <div className="sources">
                      Sources: IMD · INCOIS · ISRO · Buoy Network
                    </div>
                  </div>

                  <span className="time">12:43 PM</span>
                </div>
              </div>
            </div>

            {/* SUGGESTIONS */}
            <div className="ask-area">
              <span className="eyebrow">TRY ASKING</span>

              <div className="suggestions">
                <button>Where is the nearest PFZ today?</button>
                <button>What are the sea conditions near Kochi?</button>
                <button>Are there any cyclone or lightning alerts?</button>
                <button>Which areas have high chlorophyll?</button>
              </div>

              <div className="input-box">
                <input
                  type="text"
                  placeholder="Ask Marine AI about the ocean..."
                />

                <button className="send">↑</button>
              </div>

              <p className="input-note">
                Marine AI can reason across satellite, weather and ocean data.
              </p>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="context-panel">
            <div className="context-header">
              <span className="eyebrow">LIVE CONTEXT</span>
              <h2>Arabian Sea</h2>
            </div>

            <div className="satellite-card">
              <img src="/src/assets/satellite.jpg" alt="Arabian Sea" />
              <div className="satellite-label">
                <strong>OCEANSAT-3</strong>
                <span>Satellite observation</span>
              </div>
            </div>

            <div className="big-stat">
              <span>SEA SURFACE TEMPERATURE</span>
              <strong>28.4°C</strong>

              <div className="stat-line">
                <div></div>
              </div>

              <small>+0.3°C from seasonal baseline</small>
            </div>

            <div className="small-stats">
              <div className="stat-card">
                <span>WAVE HEIGHT</span>
                <strong>1.2 m</strong>
                <small>Normal</small>
              </div>

              <div className="stat-card">
                <span>WIND</span>
                <strong>14 km/h</strong>
                <small>Moderate</small>
              </div>

              <div className="stat-card">
                <span>VISIBILITY</span>
                <strong>Good</strong>
                <small>Stable</small>
              </div>

              <div className="stat-card">
                <span>ALERT LEVEL</span>
                <strong>Low</strong>
                <small>No severe warning</small>
              </div>
            </div>

            <div className="observation">
              <span className="eyebrow">LATEST OBSERVATION</span>
              <p>
                Satellite SST and buoy observations are currently within
                monitored operational limits.
              </p>

              <div className="observation-time">
                Updated 12:42 UTC
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;