.. _implementation-details:

Implementation Details
=========================

This section delves into the specifics of each core Python module within the project.

.. _impl-cyber-monitor:

Cyber Article Monitor (`cyber_monitor.py`)
-----------------------------------------------
The ``CyberMonitor`` class is responsible for automated fetching and initial processing of articles from web sources, primarily NewsNow.

*   **Initialization (`__init__`)**:

      *   Instantiates an ``IOCAnalyzer`` object for subsequent analysis tasks.
      *   Sets the target ``article_url`` (NewsNow Cyber Attacks page).
      *   Configures HTTP ``headers`` to mimic a browser.
      *   Initializes an empty ``seen_articles`` set to prevent re-processing.
      *   Compiles a regular expression (``ioc_pattern``) for basic IOC detection (IPs, domains, hashes) in titles.

*   **Article Fetching (`get_articles`)**:

      *   Uses the ``requests`` library to fetch the content of ``article_url``.
      *   Parses the HTML response using ``BeautifulSoup``.
      *   Finds all ``<article>`` HTML elements.
      *   Calls ``_process_articles`` to further refine the extracted data.

*   **Article Processing (`_process_articles`)**:

      *   Iterates through raw article elements.
      *   Extracts the title and the initial redirect URL (NewsNow links are often redirects).
      *   **Redirect Handling**: Attempts to follow the redirect URL to find the *actual* source article URL. It tries multiple strategies to find the real link on the redirect page (looking for specific ``div`` classes or any plausible outgoing link). If unsuccessful, it defaults to the redirect URL.
      *   Extracts the publication timestamp.
      *   Calls ``_extract_iocs`` to find IOCs in the article title.
      *   Appends a structured dictionary (title, link, time, potential_iocs) to a list.

*   **IOC Extraction (`_extract_iocs`)**:

      *   Applies the pre-compiled ``ioc_pattern`` regex to the input text (article title).

*   **Article Serialization (`serialize_article`)**:

      *   Converts article data, especially ``datetime`` objects, into JSON-serializable formats (ISO format for time).

*   **Article Analysis (`analyze_article`)**:

      *   Takes an article dictionary.
      *   For each ``potential_ioc`` found in the article, it calls ``self.ioc_analyzer.generate_report(ioc)`` and ``self.ioc_analyzer.display_report(report)`` to get the analysis.
      *   Aggregates analysis results.

*   **Continuous Monitoring (`monitor_and_analyze`)**:

      *   Contains the main loop for the standalone script.
      *   Continuously calls ``get_articles``.
      *   Checks if an article (based on title and link) has been seen before.
      *   If new, prints article details, analyzes its IOCs using ``analyze_article``, prints results, and adds the article to ``seen_articles``.
      *   Pauses for a specified ``interval``.


.. _impl-ioc-analyzer:

IOC Analyzer (`ioc_analyzer.py`)
-------------------------------------
The ``IOCAnalyzer`` class is the analytical engine of the tool.

*   **Initialization (`__init__`)**:

      *   Initializes a ``rich.console.Console`` object.
      *   Calls ``_setup_gemini()`` and ``_setup_mitre()``.

*   **Gemini AI Setup (`_setup_gemini`)**:

      *   Retrieves the Gemini API key from the environment (``AI_API``).
      *   Configures ``genai`` with the API key and specific safety settings (all categories set to ``BLOCK_NONE`` to ensure comprehensive analysis, assuming input is curated or risks are accepted).
      *   Instantiates ``genai.GenerativeModel(\"gemini-2.0-flash\", ...)``.

*   **MITRE ATT&CK® Setup (`_setup_mitre`)**:

      *   Defines the path for a local cache file (`cache/mitre_attack_cache.json`).
      *   Creates the `cache` directory if it doesn't exist.
      *   Checks if the cache file exists and is younger than ``cache_age_days`` (7 days). If so, loads data from it into a ``stix2.MemoryStore``.
      *   If the cache is missing, old, or corrupt, it downloads the latest enterprise ATT&CK JSON from MITRE's GitHub repository (`https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json`) with a progress bar (using `tqdm`).
      *   Saves the downloaded data to the cache file and loads it into the ``MemoryStore``.


.. _impl-ioc-analyzer-threatfox:

ThreatFox API Integration (`search_threatfox`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*   Queries the ThreatFox API (``https://threatfox-api.abuse.ch/api/v1/``) using a POST request with the ``search_ioc`` query type.
*   Implements a retry mechanism (3 attempts with a 2-second delay) to handle transient network issues or API errors (like HTTP 499).
*   Returns the JSON response from ThreatFox or an error structure if all retries fail.

.. _impl-ioc-analyzer-mitre:

MITRE ATT&CK® Framework Integration (`map_to_mitre`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*   Takes IOC data (typically from ThreatFox) as input.
*   Extracts threat type, description, and malware information.
*   Defines ``relevant_tactics`` based on common threat types (e.g., 'botnet_cc' maps to 'Initial Access', 'Command and Control').
*   Queries its local ``self.attack_data`` (MITRE MemoryStore) for all attack patterns.
*   Matches techniques if:

      *   The technique's kill chain phases include any ``relevant_tactics`` for the IOC's threat type.
      *   OR the technique's description contains keywords from the IOC's threat description or malware name.

*   Returns a list of matching techniques with their ID, name, description, tactics, and URL on the MITRE website.

.. _impl-ioc-analyzer-gemini:

Gemini AI Analysis (`analyze_with_gemini`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*   First, calls ``map_to_mitre`` to get MITRE context for the IOC data.
*   Constructs a detailed prompt for Gemini AI, including the IOC data (from ThreatFox) and the MITRE mapping. The prompt asks Gemini to provide:

      1.  Threat Level: \[Low/Medium/High]
      2.  Impact: \[Brief description of potential impact]
      3.  Recommended Actions: \[List key actions]
      4.  Related Threat Actors: \[If any]
      5.  Historical Context: \[If available]

*   Sends the prompt to the configured Gemini model.
*   Parses Gemini's text response, expecting the structured format requested in the prompt, and populates a dictionary with these sections.
*   Returns a dictionary containing the parsed AI analysis, the raw IOC data, and the MITRE mapping.

.. _impl-ioc-analyzer-report-gen:

Report Generation (`generate_report`, `display_report`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*   **generate_report(ioc)**:

      *   Orchestrates IOC analysis: calls ``search_threatfox(ioc)`` and then ``analyze_with_gemini()`` with the ThreatFox data.
      *   Returns a consolidated dictionary with the original IOC, ThreatFox data, and the full AI analysis object.

*   **display_report(report)**:

      *  Takes the report dictionary generated by ``generate_report``.
      *  Formats the entire report into an HTML string. This includes:

         *  Basic IOC information.
         *  AI Analysis sections (Threat Level, Impact, etc.).
         *  Detailed ThreatFox data (using ``rich.table.Table`` converted to HTML, or direct HTML formatting).
         *  MITRE ATT&CK® Mappings (also potentially using ``rich.table.Table`` or direct HTML).

      *  Wraps the output in a ``<div class='report-container'>``.


.. _impl-ioc-analyzer-article-analysis:

Article Content Analysis (`analyze_article_content`, `_format_article_analysis_html`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
*   **`analyze_article_content(content)`**:

      *   Takes raw article text as input.
      *   Constructs a prompt for Gemini AI to:

         1.  Summarize the article.
         2.  List key entities (organizations, malware, vulnerabilities).
         3.  Assess the overall threat.

      *   Parses Gemini's response into sections.

*  **`_format_article_analysis_html(sections)`**:

      *   Formats the parsed article analysis into an HTML string.

.. _impl-web-monitor:

Web Interface and API (`web_monitor.py`)
---------------------------------------------
This module uses FastAPI to create the web application and its associated APIs.

*   **Application Setup**:

      *   Initializes a ``FastAPI`` app instance.
      *   Uses an ``asynccontextmanager`` named ``lifespan`` to initialize ``CyberMonitor`` and ``IOCAnalyzer`` instances on application startup and start the ``monitor_thread`` background task.
      *   Mounts a ``/static`` directory for static assets (CSS, JS, images).
      *   Configures ``Jinja2Templates`` for rendering HTML pages from a "templates" directory.

*   **Background Monitoring (`monitor_thread`)**:

      *   Runs as an ``asyncio`` task.
      *   Includes a demo article that is always present in the ``recent_articles`` list.
      *   Periodically (every 10 minutes / 600 seconds in the current code, although this can be adjusted as needed) calls ``monitor.get_articles()``.
      *   For new articles, it calls ``monitor.analyze_article()``.
      *   Appends the new article and its analysis to a global ``recent_articles`` list (capped at 50 new + 1 demo).
      *   Broadcasts the new article data to all connected WebSocket clients using ``broadcast_message``.

*   **WebSocket Communication (`websocket_endpoint`, `broadcast_message`)**:

      *   **`/ws` endpoint**: Handles WebSocket connections.

         *   On connection, adds the client to an ``active_connections`` set.
         *   Sends the current ``recent_articles`` list to the newly connected client (``initial_data``).
         *   Listens for messages; primarily for keep-alive or future client-to-server commands (currently sends "pong").
         *   Removes clients from ``active_connections`` on disconnect or error.

      *   **`broadcast_message(message)`**: Iterates through ``active_connections`` and sends JSON messages. It ensures ``datetime`` objects are serialized before sending.

*   **Main Web Page (`/`)**:

      *   Renders ``templates/monitor.html``, passing the current ``recent_articles`` to the template for display.

*   **Key API Endpoints**:

      *   **`GET /recent_iocs`**:

         *   Queries the ThreatFox API for IOCs reported in the last day (``query: get_iocs, days: 1``).
         *   Returns the latest 10 IOCs as JSON. Includes error handling for API issues.

      *   **`POST /analyze`**:

         *   Expects an ``ioc`` in the request payload.
         *   Calls ``ioc_analyzer.generate_report(ioc)`` and ``ioc_analyzer.display_report(report)`` to get the HTML analysis.
         *   Calls ``check_pcap_for_ioc(ioc)`` to scan a local ``.pcapng`` file.
         *   Returns a JSON response containing the ``html_report`` and ``pcap_check_result``.

      *   **`POST /analyze_article`**:

         *   Expects ``article_content`` in the request payload.
         *   Calls ``ioc_analyzer.analyze_article_content(article_content)`` and ``ioc_analyzer._format_article_analysis_html()``.
         *   Returns a JSON response with the ``html_analysis``.

*   **PCAP Analysis (`check_pcap_for_ioc`)**:

      *   Searches for the first ``.pcapng`` file in the application's root directory.
      *   Uses ``subprocess.run`` to execute ``tshark -r <pcap_file> -Y 'frame contains \"<ioc_search_term>\"'``.
      *   (Note: The IOC is slightly modified by removing "www." before searching).
      *   Returns whether the IOC was found and any matching packet details from ``tshark``'s output.


.. _impl-rss-monitor:

RSS Feed Monitor (`rss_monitor.py`)
----------------------------------------
The ``rss_monitor.py`` script is a more straightforward component for fetching data from RSS feeds.

*   **Functionality**:

      *   Uses the ``feedparser`` library.
      *   Is configured with the ThreatPost RSS feed URL (``https://threatpost.com/feed/``).
      *   Parses the feed.
      *   Prints the feed title and the title of the most recent article.

*   **Current State**: As implemented, it's a one-shot script. It does not have a continuous monitoring loop or directly integrate into the ``WebMonitor``'s background task or ``CyberMonitor``'s data flow for automated, ongoing analysis in the main application. It serves as a proof-of-concept or utility for fetching from ThreatPost. To meet FR01 fully for ThreatPost in an automated way similar to NewsNow, its logic would need to be integrated into a persistent monitoring loop, likely within the ``CyberMonitor`` class or the ``web_monitor.py`` background task.



