import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  confirmText = "Xóa",
  cancelText = "Hủy",
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex justify-between items-center px-5 py-3 border-b">
                <Dialog.Title className="text-lg font-semibold text-gray-800">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 text-center">
                <AlertTriangle size={40} className="mx-auto text-red-500 mb-3" />
                <p className="text-gray-700">{message}</p>
              </div>

              <div className="px-6 py-3 border-t flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm} // chỉ gọi onConfirm, không tự onClose
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  {confirmText}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
