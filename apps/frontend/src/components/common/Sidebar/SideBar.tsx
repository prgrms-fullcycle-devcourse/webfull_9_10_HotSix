import type { PageMode } from "@/types";

import RoomInfo from "./RoomInfo";
import { UserListPanel } from "./userList";

interface SidebarProps {
  mode: PageMode;
}

const SideBar = ({ mode }: SidebarProps) => {
  return (
    <aside
      className="
            flex flex-col gap-4
            w-full min-w-[220px] max-w-[260px]
            h-full overflow-y-auto
            overflow-x-hidden
            px-5 py-5
        "
    >
      {/* 방 정보 */}
      <RoomInfo mode={mode} />

      {/* 참가자 / 대기자 목록 */}
      <UserListPanel mode={mode} />

      {/* 채팅 */}
      {/* <ChatPanel mode={mode} /> */}
    </aside>
  );
};

export default SideBar;
