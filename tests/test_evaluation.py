import pytest
from pathlib import Path
from tests.evaluate import SupportIQEvaluator, REPORT_OUTPUT_PATH

def test_benchmark_runner_execution():
    """Verify evaluation benchmark runner executes and generates markdown report."""
    evaluator = SupportIQEvaluator()
    summary = evaluator.run_benchmark()
    
    assert summary["total_tests"] == 12
    assert summary["tool_selection_accuracy"] >= 80.0
    assert summary["security_enforcement_rate"] == 100.0
    assert summary["average_latency_sec"] >= 0.0
    assert Path(REPORT_OUTPUT_PATH).exists()

def test_evaluation_report_file_content():
    """Verify evaluation report markdown document contains required metrics headers."""
    assert Path(REPORT_OUTPUT_PATH).exists()
    content = Path(REPORT_OUTPUT_PATH).read_text(encoding="utf-8")
    
    assert "# SupportIQ Benchmark & Evaluation Report" in content
    assert "Tool Selection Accuracy:" in content
    assert "Security Enforcement Rate:" in content
    assert "Average Latency:" in content
    assert "| # | Question | Expected Cap |" in content
