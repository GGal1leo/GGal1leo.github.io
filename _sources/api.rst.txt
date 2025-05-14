.. _api-documentation:

API Documentation
=================================
This section provides an overview of the main programmatic interfaces (classes and key methods) within the project. For detailed type hints and internal logic, please refer to the source code comments and Python type annotations.

.. _api-ioc-analyzer:

`IOCAnalyzer` Class (`ioc_analyzer.py`)
--------------------------------------------
The central class for all IOC and article analysis tasks.

*   **`__init__(self)`**:

      *   Initializes Gemini AI, MITRE ATT&CK® cache, and console utilities.

*   **`search_threatfox(self, ioc: str) -> Dict`**:

      *   Queries ThreatFox API for information about the given ``ioc``.
      *   Returns a dictionary with ThreatFox data.

*   **`map_to_mitre(self, ioc_data: Dict) -> List[Dict]`**:

      *   Maps enriched ``ioc_data`` (usually from ThreatFox) to MITRE ATT&CK® techniques.
      *   Returns a list of dictionaries, each representing a matched technique.

*   **`analyze_with_gemini(self, ioc_data: Dict) -> Dict`**:

      *   Sends ``ioc_data`` (including MITRE mappings) to Gemini AI for detailed analysis (threat level, impact, recommendations).
      *   Returns a dictionary with the structured AI analysis.

*   **`generate_report(self, ioc: str) -> Dict`**:

      *   Orchestrates the full analysis of an ``ioc`` by calling ``search_threatfox`` and ``analyze_with_gemini``.
      *   Returns a comprehensive report dictionary.

*   **`display_report(self, report: Dict) -> str`**:

      *   Formats the comprehensive ``report`` dictionary into an HTML string for display.

*   **`analyze_article_content(self, content: str) -> Dict`**:

      *   Sends full ``content`` text to Gemini AI for summarization and threat assessment.
      *   Returns a dictionary of the parsed AI analysis sections.

*   **`_format_article_analysis_html(self, sections: Dict) -> str`**:

      *   Formats the article analysis ``sections`` into an HTML string.


.. _api-cyber-monitor:

`CyberMonitor` Class (`cyber_monitor.py`)
----------------------------------------------
Manages fetching and initial processing of articles from web sources.

*   **`__init__(self)`**:

      *   Initializes an ``IOCAnalyzer`` instance, sets target URL, headers, and IOC patterns.

*   **`get_articles(self) -> List[Dict]`**:

      *   Fetches and parses articles from the configured URL.
      *   Returns a list of processed article dictionaries.

*   **`analyze_article(self, article: Dict) -> Dict`**:

      *   Analyzes IOCs found in a given ``article`` dictionary using its ``IOCAnalyzer`` instance.
      *   Returns analysis results.

*   **`monitor_and_analyze(self, interval: int = 60)`**:

      *   The main loop for standalone execution, continuously fetching and analyzing new articles.

*   **`serialize_article(self, article: Dict) -> Dict`**:

      *   Converts an article dictionary to a JSON-serializable format.

.. _api-web-endpoints:

Web API Endpoints (`web_monitor.py`)
-----------------------------------------
Key FastAPI endpoints for web interface interaction and AJAX calls.

*   **`GET /`**:

      *   Serves the main HTML page (`monitor.html`).

*   **`WEBSOCKET /ws`**:

      *   Handles WebSocket connections for real-time updates to clients.
      *   Sends initial data and broadcasts new article analyses.

*   **`GET /recent_iocs`**:

      *   Fetches and returns the last 10 IOCs from ThreatFox (reported in the last day) as JSON.

*   **`POST /analyze`**:

      *   **Request**: JSON payload with ``{"ioc": "ioc_value_here"}``.
      *   **Response**: JSON with ``{"html_report": "...", "pcap_check_result": "..."}``.
      *   Analyzes the provided IOC using ``IOCAnalyzer`` and checks it against a local PCAP file.

*   **`POST /analyze_article`**:

      *   **Request**: JSON payload with ``{"article_content": "full_text_here"}``.
      *   **Response**: JSON with ``{"html_analysis": "..."}``.
      *   Analyzes the provided article text using ``IOCAnalyzer``.


