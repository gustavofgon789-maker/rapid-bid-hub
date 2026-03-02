import { Link, useLocation } from "react-router-dom";
import {
  Megaphone,
  Gavel,
  ShoppingCart,
  CheckCircle,
  History,
  Settings,
  Package,
  Truck,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const sellerItems = [
  { title: "Meus Anúncios", url: "/dashboard/anuncios", icon: Megaphone },
  { title: "Propostas Recebidas", url: "/dashboard/propostas-recebidas", icon: ClipboardList },
  { title: "Vendas em Andamento", url: "/dashboard/vendas-andamento", icon: Truck },
  { title: "Vendas Concluídas", url: "/dashboard/vendas-concluidas", icon: CheckCircle },
  { title: "Histórico", url: "/dashboard/historico-vendas", icon: History },
];

const buyerItems = [
  { title: "Propostas Enviadas", url: "/dashboard/propostas-enviadas", icon: Gavel },
  { title: "Compras em Andamento", url: "/dashboard/compras-andamento", icon: ShoppingCart },
  { title: "Compras Concluídas", url: "/dashboard/compras-concluidas", icon: Package },
  { title: "Histórico", url: "/dashboard/historico-compras", icon: History },
];

const configItems = [
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Anunciante</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sellerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Comprador</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buyerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
