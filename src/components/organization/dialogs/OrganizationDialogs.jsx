// src/components/organization/OrganizationDialogs.jsx
import React from 'react';
import EditOrganizationDialog from '../../dialogs/EditOrganizationDialog';
import CreateWarehouseDialog from '../../dialogs/CreateWarehouseDialog';
import EditWarehouseDialog from '../../dialogs/EditWarehouseDialog';
import InviteMemberDialog from '../../dialogs/InviteMemberDialog';
import QrCodeDialog from '../../dialogs/QrCodeDialog';

const OrganizationDialogs = ({
  dialogs,
  organization,
  selectedWarehouse,
  onClose,
  onUpdateOrganization,
  onCreateWarehouse,
  onUpdateWarehouse,
  onInviteMember,
  organizationId
}) => {
  return (
    <>
      <EditOrganizationDialog 
        open={dialogs.editOrganization} 
        organization={organization} 
        onClose={() => onClose('editOrganization')} 
        onSave={onUpdateOrganization} 
      />
      
      <CreateWarehouseDialog 
        open={dialogs.createWarehouse} 
        onClose={() => onClose('createWarehouse')} 
        onCreate={onCreateWarehouse} 
      />
      
      <EditWarehouseDialog 
        open={dialogs.editWarehouse} 
        warehouse={selectedWarehouse} 
        onClose={() => {
          onClose('editWarehouse');
        }} 
        onUpdate={onUpdateWarehouse} 
      />
      
      <InviteMemberDialog 
        open={dialogs.inviteMember} 
        onClose={() => onClose('inviteMember')} 
        onInvite={onInviteMember} 
      />
      
      <QrCodeDialog 
        open={dialogs.qrCode} 
        organizationId={organizationId} 
        organizationName={organization.name} 
        onClose={() => onClose('qrCode')} 
      />
    </>
  );
};

export default OrganizationDialogs;