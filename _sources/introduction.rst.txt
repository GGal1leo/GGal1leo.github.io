Introduction
===============

.. _intro-overview:

Project Overview
---------------------

This document provides comprehensive documentation for the AI-Powered Cyber Incident Monitoring Tool, a sophisticated system designed to automate the collection, analysis, and reporting of cybersecurity threats. The tool leverages cutting-edge technologies including Google's Gemini AI for advanced analysis, the ThreatFox API for IOC (Indicator of Compromise) enrichment, and mapping against the MITRE ATT&CK® framework to provide context to identified threats. The primary goal is to enhance the efficiency and accuracy of threat detection and response, empowering cybersecurity professionals to proactively defend against evolving cyber threats by providing timely, actionable intelligence through both a web interface and a command-line interface (CLI).

.. _intro-background-motivation:

Background and Motivation
------------------------------

The cybersecurity landscape is characterized by an ever-increasing volume and sophistication of threats. Traditional manual methods of threat monitoring and analysis are often insufficient to keep pace with the speed and stealth of modern attacks. Security teams can be overwhelmed by the sheer amount of data, making it challenging to identify genuine threats in a timely manner and respond effectively. This project is motivated by the critical need to:

*   **Automate** the labor-intensive process of threat data collection and initial IOC identification.
*   Provide **real-time analysis** of potential threats to reduce detection and response times.
*   **Integrate multiple threat intelligence sources** to build a more comprehensive understanding of IOCs.
*   Generate **actionable insights** that are directly relevant to security operations teams.
*   **Standardize threat reporting** using established frameworks like MITRE ATT&CK® for better communication and understanding of adversarial tactics, techniques, and procedures (TTPs).
*   **Reduce response fatigue** by helping to prioritize threats, allowing teams to focus on the most critical incidents.

This tool aims to address these challenges by providing an intelligent, automated solution that assists cybersecurity professionals in navigating the complex threat landscape.

.. _intro-objectives:

Project Objectives
-----------------------

The primary objectives for the AI-Powered Cyber Incident Monitoring Tool are:

1.  **Automated Threat Data Collection**: Continuously gather articles and threat data from pre-defined web sources (NewsNow, ThreatPost RSS).
2.  **AI-Driven IOC Extraction and Analysis**: Utilize Google's Gemini AI to extract potential IOCs from collected data and perform in-depth analysis of these IOCs and related article content.
3.  **IOC Enrichment via ThreatFox**: Integrate with the ThreatFox API to enrich identified IOCs with up-to-date threat intelligence.
4.  **MITRE ATT&CK® Framework Mapping**: Map enriched IOC data to the MITRE ATT&CK® framework to provide standardized context on adversary behaviors.
5.  **Web Interface for Visualization and Interaction**: Develop a user-friendly web interface (FastAPI, Jinja2) to display monitored articles, IOCs, detailed analysis reports, and allow manual IOC submission and PCAP file analysis, with real-time updates via WebSockets.
6.  **Command-Line Interface (CLI)**: Provide a basic CLI for IOC analysis and report generation, catering to automation and scripting needs.
7.  **Automated HTML Report Generation**: Generate comprehensive HTML reports for analyzed IOCs.
8.  **System Reliability and Maintainability**: Ensure the system is designed modularly, handles errors gracefully, and manages configurations securely.


.. _intro-scope:

Scope of Work
------------------

.. _intro-scope-in:

In Scope
^^^^^^^^^^^^^^^
The project encompasses the following functionalities and features, as detailed in the project specification:

*   **Data Collection**: Automated collection from NewsNow (Cyber Attacks section) and ThreatPost RSS feed.
*   **IOC Extraction**: Using regular expressions and Gemini AI from collected articles.
*   **Gemini AI Integration**: For IOC extraction, IOC analysis (generating threat level, impact, recommendations), and full article content summarization.
*   **ThreatFox API Integration**: For enriching IOCs with details like threat type, malware associations, and confidence levels.
*   **MITRE ATT&CK® Mapping**: Utilizing a locally cached MITRE ATT&CK® enterprise dataset (JSON from GitHub) to map IOCs to TTPs.
*   **Web Interface (FastAPI)**:

      *   Dashboard for recent articles and status.
      *   Detailed article view with AI analysis.
      *   Manual IOC submission and analysis.
      *   Display of HTML reports for IOCs.
      *   Real-time updates via WebSockets.
      *   PCAP file analysis (using ``tshark``) to check for IOC presence.

*   **CLI**: Basic functionality for submitting an IOC and receiving an analysis report (FR15).
*   **Reporting**: Automated generation of HTML reports for IOC analysis.
*   **Caching**: Local caching for MITRE ATT&CK® data with periodic refresh.
*   **Configuration**: Secure management of API keys via environment variables (``.env`` file).
*   **Error Handling**: Graceful handling of API failures and other operational errors.
*   **Modularity**: A modular codebase to facilitate maintenance and future enhancements.

.. _intro-scope-out:

Out of Scope
^^^^^^^^^^^^^^^^^^^
The initial version of this project will not include:

*   Advanced user authentication and role-based access control (RBAC) for the web interface.
*   Sophisticated, customizable threat ranking based on detailed organizational profiles.
*   Active blocking or remediation capabilities (the tool is for monitoring and analysis).
*   Distributed deployment or high-availability clustering.
*   Training custom machine learning models for IOC detection (relies on Gemini AI's capabilities).
*   Extensive support for a wide array of data sources beyond those initially specified.


