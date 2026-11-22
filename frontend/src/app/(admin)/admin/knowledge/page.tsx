"use client";

import React, { useState } from "react";
import {
  BookOpen,
  UploadCloud,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  FileCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KnowledgeDoc {
  id: string;
  title: string;
  filename: string;
  fileType: "pdf" | "docx" | "txt" | "md";
  size: string;
  pages: number;
  chunks: number;
  status: "INDEXED" | "PROCESSING" | "QUEUED" | "FAILED" | "INACTIVE";
  uploadedAt: string;
  isActive: boolean;
}

const INITIAL_DOCUMENTS: KnowledgeDoc[] = [
  {
    id: "doc-1",
    title: "Enterprise Visitor Access & Security Policy 2026",
    filename: "visitor_access_policy_2026.pdf",
    fileType: "pdf",
    size: "2.4 MB",
    pages: 14,
    chunks: 38,
    status: "INDEXED",
    uploadedAt: "2026-11-18 09:30",
    isActive: true,
  },
  {
    id: "doc-2",
    title: "Main Campus Office Navigation & Facility Map",
    filename: "campus_facilities_guide.docx",
    fileType: "docx",
    size: "1.8 MB",
    pages: 8,
    chunks: 22,
    status: "INDEXED",
    uploadedAt: "2026-11-19 14:15",
    isActive: true,
  },
  {
    id: "doc-3",
    title: "Executive Floor Protocols & Escort Requirements",
    filename: "executive_floor_protocols.md",
    fileType: "md",
    size: "42 KB",
    pages: 3,
    chunks: 9,
    status: "INDEXED",
    uploadedAt: "2026-11-20 11:00",
    isActive: true,
  },
  {
    id: "doc-4",
    title: "Q4 Vendor Deliveries & Loading Dock Guidelines",
    filename: "loading_dock_guidelines.txt",
    fileType: "txt",
    size: "18 KB",
    pages: 2,
    chunks: 5,
    status: "INDEXED",
    uploadedAt: "2026-11-21 16:45",
    isActive: true,
  },
  {
    id: "doc-5",
    title: "Legacy Parking Validation Rules (Draft)",
    filename: "parking_rules_draft.pdf",
    fileType: "pdf",
    size: "950 KB",
    pages: 4,
    chunks: 11,
    status: "INACTIVE",
    uploadedAt: "2026-11-15 08:20",
    isActive: false,
  },
];

export default function KnowledgeBaseAdminPage() {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState<Array<{
    content: string;
    source: string;
    score: number;
    page: number;
  }> | null>(null);

  // Statistics
  const totalDocs = documents.length;
  const indexedDocs = documents.filter((d) => d.status === "INDEXED").length;
  const totalChunks = documents.reduce((acc, curr) => acc + curr.chunks, 0);

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action handlers
  const handleToggleActive = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const nextActive = !doc.isActive;
          return {
            ...doc,
            isActive: nextActive,
            status: nextActive ? "INDEXED" : "INACTIVE",
          };
        }
        return doc;
      })
    );
  };

  const handleReprocess = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status: "PROCESSING" } : doc))
    );
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, status: "INDEXED" } : doc))
      );
    }, 1800);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document and remove all vectors from Qdrant?")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() as "pdf" | "docx" | "txt" | "md";

    setTimeout(() => {
      const newDoc: KnowledgeDoc = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        filename: file.name,
        fileType: ["pdf", "docx", "txt", "md"].includes(ext) ? ext : "pdf",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: 5,
        chunks: 14,
        status: "INDEXED",
        uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        isActive: true,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setSelectedFileName(null);
    }, 1500);
  };

  const handleTestRetrieval = () => {
    if (!testQuery.trim()) return;

    // Simulate semantic vector retrieval
    setTestResults([
      {
        content:
          "All visitors must register at the lobby kiosk on level G, wear an authorized badge, and remain escorted in secure laboratory suites.",
        source: "visitor_access_policy_2026.pdf",
        score: 0.94,
        page: 2,
      },
      {
        content:
          "Visitor parking validation is available at the reception desk for levels P1 and P2 during regular business hours (8:00 AM - 6:00 PM).",
        source: "campus_facilities_guide.docx",
        score: 0.88,
        page: 4,
      },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Upload Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Enterprise Knowledge Base
            </h1>
            <Badge variant="default" className="bg-sky-500/20 text-sky-400 border border-sky-500/30">
              RAG Engine v1.0
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage company documents, policies, directories, and vector embeddings for grounded AI virtual receptionist answers.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="relative cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm transition-colors shadow-lg shadow-sky-500/20">
          <UploadCloud className="w-4 h-4" />
          {isUploading ? "Ingesting Document..." : "Upload Knowledge Document"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleSimulateUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Documents</CardTitle>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalDocs}</div>
            <p className="text-xs text-slate-500 mt-1">Multi-format corporate documents</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Indexed & Grounded</CardTitle>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{indexedDocs}</div>
            <p className="text-xs text-emerald-400 mt-1">Active in Receptionist memory</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Indexed Chunks</CardTitle>
            <Database className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalChunks}</div>
            <p className="text-xs text-slate-500 mt-1">1536-d vectors stored in Qdrant</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Isolation & Boundary</CardTitle>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">Enforced</div>
            <p className="text-xs text-slate-500 mt-1">Tenant-scoped vector filtering</p>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Search Sandbox Card */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <CardTitle className="text-base text-white">Semantic Retrieval Verification Sandbox</CardTitle>
            </div>
            <span className="text-xs text-slate-500 font-mono">Similarity Threshold: 0.70</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ask a question to test document retrieval (e.g. 'What is the visitor parking policy?')..."
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestRetrieval()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={handleTestRetrieval}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm transition-colors flex items-center gap-2"
            >
              Test Query
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {testResults && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Retrieved Context Chunks ({testResults.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-medium text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        {res.source} (Page {res.page})
                      </span>
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        Cosine: {(res.score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">"{res.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "INDEXED", "INACTIVE", "PROCESSING", "FAILED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Documents Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Document Title & Filename</th>
                <th className="px-6 py-4 font-semibold">Format</th>
                <th className="px-6 py-4 font-semibold">Size & Chunks</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Uploaded</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No documents matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-medium text-white">{doc.title}</span>
                          <span className="block text-xs text-slate-500 font-mono">{doc.filename}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant="default" className="text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                        {doc.fileType}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div>{doc.size} ({doc.pages} pages)</div>
                      <div className="text-slate-500">{doc.chunks} chunks</div>
                    </td>

                    <td className="px-6 py-4">
                      {doc.status === "INDEXED" && (
                        <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Indexed
                        </Badge>
                      )}
                      {doc.status === "PROCESSING" && (
                        <Badge variant="default" className="bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse">
                          Processing
                        </Badge>
                      )}
                      {doc.status === "QUEUED" && (
                        <Badge variant="default" className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Queued
                        </Badge>
                      )}
                      {doc.status === "INACTIVE" && (
                        <Badge variant="default" className="bg-slate-800 text-slate-400">
                          Inactive
                        </Badge>
                      )}
                      {doc.status === "FAILED" && (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {doc.uploadedAt}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(doc.id)}
                          title={doc.isActive ? "Deactivate Document" : "Activate Document"}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            doc.isActive
                              ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          }`}
                        >
                          {doc.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleReprocess(doc.id)}
                          title="Reprocess & Re-index"
                          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-sky-400 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Delete Document & Vectors"
                          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
