import { ReactNode } from 'react'

interface LayoutProps {
    children: ReactNode;
    flex?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, flex }) => {
    return (
        <div className={`mx-auto w-[97.5%] md:w-[60%] ${flex ? 'flex' : ''}`}>
        {children}
        </div>
    );
};

export default Layout;