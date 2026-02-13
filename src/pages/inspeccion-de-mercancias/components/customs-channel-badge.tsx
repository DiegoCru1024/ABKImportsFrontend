import type { CustomsChannel } from "@/api/interface/inspectionInterface";

interface CustomsChannelBadgeProps {
  channel: CustomsChannel | undefined;
}

export function CustomsChannelBadge({ channel }: CustomsChannelBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Canal Aduanero
      </h3>
      <div className="flex items-center gap-3 bg-gray-900 px-5 py-2.5 rounded-full">
        {/* Red light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "red"
              ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              : "bg-gray-600"
          }`}
        />
        {/* Yellow light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "yellow"
              ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]"
              : "bg-gray-600"
          }`}
        />
        {/* Green light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "green"
              ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]"
              : "bg-gray-600"
          }`}
        />
      </div>
      {channel && (
        <span className={`text-xs font-medium ${
          channel === "red" ? "text-red-600" :
          channel === "yellow" ? "text-yellow-600" :
          "text-green-600"
        }`}>
          {channel === "red" ? "Canal Rojo" :
           channel === "yellow" ? "Canal Naranja" :
           "Canal Verde"}
        </span>
      )}
    </div>
  );
}
